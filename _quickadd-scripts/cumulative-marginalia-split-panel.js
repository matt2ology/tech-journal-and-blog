module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  /**
   * Responsible solely for reading the active file and extracting summary blocks.
   */
  class SummaryExtractor {
    async extractFromActiveFile() {
      const activeMarkdownFile = app.workspace.getActiveFile();
      if (!activeMarkdownFile) {
        new Notice("No active markdown file found.");
        return null;
      }

      const fileContent = await app.vault.read(activeMarkdownFile);
      const summaryRegex =
        />\s*\[!summary\]\s*Cumulative Summary([^\n]*(\n>[^\n]*)*)/gi;

      const regexMatches = [...fileContent.matchAll(summaryRegex)];
      const extractedSummaries = regexMatches.map((match) => {
        const blockContent = match[1];
        // Keep lines as an array of individual text rows so we can address them explicitly
        const lines = blockContent
          .split("\n")
          .map((line) => line.replace(/^>\s?/, "").trim());

        return {
          // Join with double newlines (\n\n) to preserve block/paragraph spacing for full summaries
          fullText: lines.filter(Boolean).join("\n\n"),
          lines: lines,
        };
      });

      if (extractedSummaries.length === 0) {
        new Notice("No Cumulative Summaries found in this file.");
        return null;
      }

      return {
        fileName: activeMarkdownFile.basename,
        filePath: activeMarkdownFile.path,
        summaries: extractedSummaries,
      };
    }
  }

  /**
   * Responsible solely for UI presentation in a non-overlapping floating window with a display toggle.
   */
  class PanelPresenter {
    async presentInFloatingWindow(title, summaries, sourcePath) {
      // Close previous summary floating window if currently open
      if (app.cumulativeSummaryWindowLeaf) {
        try {
          app.cumulativeSummaryWindowLeaf.detach();
        } catch {}
        app.cumulativeSummaryWindowLeaf = null;
      }

      const width = 480;
      const height = 1080;

      // Calculate position to the right of the main application window to prevent overlap
      const dualScreenLeft =
        window.screenLeft !== undefined ? window.screenLeft : window.screenX;
      const dualScreenTop =
        window.screenTop !== undefined ? window.screenTop : window.screenY;
      const mainWidth = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
          ? document.documentElement.clientWidth
          : screen.width;

      const left = dualScreenLeft + mainWidth - width - 50;
      const top = dualScreenTop + 80;

      // Open a floating popout window leaf
      const popoutLeaf = app.workspace.openPopoutLeaf({
        size: { width: width, height: height },
      });

      if (!popoutLeaf) {
        new Notice("Could not open floating summary window.");
        return;
      }

      app.cumulativeSummaryWindowLeaf = popoutLeaf;

      // Position the popup window safely off to the side so it doesn't overlay input modals
      setTimeout(() => {
        try {
          const win =
            popoutLeaf.view.containerEl.win ||
            popoutLeaf.view.containerEl.ownerDocument.defaultView;
          if (win && typeof win.moveTo === "function") {
            win.moveTo(Math.max(0, left), Math.max(0, top));
          }
        } catch (e) {
          // Fallback if window moving is restricted by environment security
        }
      }, 50);

      const containerEl = popoutLeaf.view.containerEl;
      containerEl.empty();
      containerEl.style.backgroundColor = "var(--background-primary)";
      containerEl.style.color = "var(--text-normal)";
      containerEl.style.padding = "20px";
      containerEl.style.overflowY = "auto";
      containerEl.style.display = "flex";
      containerEl.style.flexDirection = "column";

      // Floating Window Header
      const headerEl = document.createElement("div");
      headerEl.style.display = "flex";
      headerEl.style.justifyContent = "space-between";
      headerEl.style.alignItems = "center";
      headerEl.style.marginBottom = "20px";
      headerEl.style.borderBottom =
        "1px solid var(--background-modifier-border)";
      headerEl.style.paddingBottom = "10px";

      const titleEl = document.createElement("h2");
      titleEl.style.margin = "0";
      titleEl.style.fontSize = "1.1rem";
      titleEl.style.color = "var(--text-normal)";
      titleEl.textContent = `Summaries: ${title}`;
      headerEl.appendChild(titleEl);

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.gap = "8px";
      buttonContainer.style.alignItems = "center";

      // Toggle Button State & Element - Default to showing second line only
      let showSecondLineOnly = true;
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "Show Full Summaries";
      toggleBtn.style.padding = "4px 8px";
      toggleBtn.style.background = "var(--background-secondary)";
      toggleBtn.style.border = "1px solid var(--background-modifier-border)";
      toggleBtn.style.borderRadius = "4px";
      toggleBtn.style.cursor = "pointer";
      toggleBtn.style.fontSize = "0.75rem";
      toggleBtn.style.color = "var(--text-accent)";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕ Close";
      closeBtn.style.padding = "4px 10px";
      closeBtn.style.background = "var(--background-secondary)";
      closeBtn.style.border = "1px solid var(--background-modifier-border)";
      closeBtn.style.borderRadius = "4px";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "0.85rem";
      closeBtn.style.color = "var(--text-muted)";
      closeBtn.onclick = () => {
        popoutLeaf.detach();
        app.cumulativeSummaryWindowLeaf = null;
      };

      buttonContainer.appendChild(toggleBtn);
      buttonContainer.appendChild(closeBtn);
      headerEl.appendChild(buttonContainer);
      containerEl.appendChild(headerEl);

      // Scrollable Cards Container
      const scrollContainer = document.createElement("div");
      scrollContainer.style.overflowY = "auto";
      scrollContainer.style.flex = "1";
      containerEl.appendChild(scrollContainer);

      const renderCards = () => {
        scrollContainer.empty();

        summaries.forEach((summaryObj, index) => {
          const card = document.createElement("div");
          card.style.marginBottom = "15px";
          card.style.padding = "15px";
          card.style.borderRadius = "8px";
          card.style.border = "1px solid var(--background-modifier-border)";
          card.style.backgroundColor = "var(--background-secondary)";

          const cardHeader = document.createElement("div");
          cardHeader.style.fontWeight = "bold";
          cardHeader.style.marginBottom = "8px";
          cardHeader.style.color = "var(--text-accent)";
          cardHeader.textContent = `Summary ${index + 1} of ${summaries.length}`;
          card.appendChild(cardHeader);

          const cardBody = document.createElement("div");
          cardBody.style.whiteSpace = "pre-line";

          // Choose content based on toggle state
          let contentToRender = summaryObj.fullText;
          if (showSecondLineOnly) {
            // Filter out empty lines to find non-empty content items sequentially
            const nonEmptyLines = summaryObj.lines.filter(Boolean);
            // Index 1 represents your expected second line of content
            contentToRender = nonEmptyLines[1] || nonEmptyLines[0] || "";
          }

          if (typeof MarkdownRenderer !== "undefined") {
            MarkdownRenderer.render(
              app,
              contentToRender,
              cardBody,
              sourcePath,
              {
                addChild: () => {},
              },
            );
          } else {
            cardBody.textContent = contentToRender;
          }
          card.appendChild(cardBody);
          scrollContainer.appendChild(card);
        });
      };

      // Toggle click handler
      toggleBtn.onclick = () => {
        showSecondLineOnly = !showSecondLineOnly;
        toggleBtn.textContent = showSecondLineOnly
          ? "Show Full Summaries"
          : "Show Second Line Only";
        toggleBtn.style.color = showSecondLineOnly
          ? "var(--text-accent)"
          : "var(--text-muted)";
        renderCards();
      };

      // Initial render
      renderCards();
    }
  }

  /**
   * Main orchestrator coordinating extraction and floating panel presentation.
   */
  class SummaryReaderOrchestrator {
    constructor() {
      this.extractor = new SummaryExtractor();
      this.presenter = new PanelPresenter();
    }

    async run() {
      const extractedData = await this.extractor.extractFromActiveFile();
      if (!extractedData) return;

      await this.presenter.presentInFloatingWindow(
        extractedData.fileName,
        extractedData.summaries,
        extractedData.filePath,
      );
    }
  }

  const orchestrator = new SummaryReaderOrchestrator();
  await orchestrator.run();
};
