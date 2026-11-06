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
        return blockContent
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join("  \n")
          .trim();
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
   * Responsible solely for UI presentation and opening content in a separate side panel.
   */
  class PanelPresenter {
    presentInSplitPanel(title, summaries, sourcePath) {
      // Split the active workspace leaf to create a new separate panel/pane
      const newLeaf = app.workspace.splitActiveLeaf("vertical");
      if (!newLeaf) {
        new Notice("Could not open a new panel.");
        return;
      }

      const containerEl = newLeaf.view.containerEl;
      containerEl.empty();
      containerEl.style.backgroundColor = "var(--background-primary)";
      containerEl.style.color = "var(--text-normal)";
      containerEl.style.padding = "20px";
      containerEl.style.overflowY = "auto";
      containerEl.style.display = "flex";
      containerEl.style.flexDirection = "column";

      // Panel Header
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
      titleEl.style.fontSize = "1.3rem";
      titleEl.style.color = "var(--text-normal)";
      titleEl.textContent = `Cumulative Summaries: ${title}`;
      headerEl.appendChild(titleEl);

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕ Close Panel";
      closeBtn.style.padding = "4px 10px";
      closeBtn.style.background = "var(--background-secondary)";
      closeBtn.style.border = "1px solid var(--background-modifier-border)";
      closeBtn.style.borderRadius = "4px";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.fontSize = "0.85rem";
      closeBtn.style.color = "var(--text-muted)";
      closeBtn.onclick = () => newLeaf.detach();
      headerEl.appendChild(closeBtn);

      containerEl.appendChild(headerEl);

      // Scrollable Cards Container
      const scrollContainer = document.createElement("div");
      scrollContainer.style.overflowY = "auto";
      scrollContainer.style.flex = "1";

      summaries.forEach((summary, index) => {
        const card = document.createElement("div");
        card.style.marginBottom = "20px";
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
        if (typeof MarkdownRenderer !== "undefined") {
          MarkdownRenderer.render(app, summary, cardBody, sourcePath, {
            addChild: () => {},
          });
        } else {
          cardBody.textContent = summary;
        }
        card.appendChild(cardBody);
        scrollContainer.appendChild(card);
      });

      containerEl.appendChild(scrollContainer);

      // Focus the new leaf panel
      app.workspace.setActiveLeaf(newLeaf);
    }
  }

  /**
   * Main orchestrator coordinating extraction and separate-panel presentation.
   */
  class SummaryReaderOrchestrator {
    constructor() {
      this.extractor = new SummaryExtractor();
      this.presenter = new PanelPresenter();
    }

    async run() {
      const extractedData = await this.extractor.extractFromActiveFile();
      if (!extractedData) return;

      this.presenter.presentInSplitPanel(
        extractedData.fileName,
        extractedData.summaries,
        extractedData.filePath,
      );
    }
  }

  const orchestrator = new SummaryReaderOrchestrator();
  await orchestrator.run();
};
