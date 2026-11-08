---
aliases: Notes on Introduction to Open Source LLMs - Understanding Open-Source LLMs - the Rise of the Open-Source LLM Movement
title: Notes on Introduction to Open Source LLMs - Understanding Open-Source LLMs - the Rise of the Open-Source LLM Movement
date: 2026-11-07T23:42:38-08:00
draft: false
slug: introduction-to-open-source-llms-understanding-open-source-llms-the-rise-of-the-open-source-llm-movement
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[laurentiu-raducu|Laurentiu Raducu]]"
course: Introduction to Open Source Llms
module: Understanding Open-source LLMs
lesson: The Rise of the Open-source LLM Movement
---

**Analysis:** [[02-introduction-to-open-source-llms-understanding-open-source-llms|Introduction to Open Source LLMs - Understanding Open-Source LLMs]]

## TL;DR (too long; didn't read)

> [!tldr] Section Summary
> In the ~6 years time as the industry become more educated and experienced with large language models (LLMs) open source models caught up to what the closed source, proprietary, models can do with more transparency, and freeing terms and conditional licensing.

## Questions

- [ ]

## The Rise of the Open-source LLM Movement

### The History of Large Language Models (LLMs)

- **2017:** Google published the transformer architecture in their paper ["Attention Is All You Need"](https://arxiv.org/abs/1706.03762)
    - First LLM Bidirectional Encoder Representations from Transformers (BERT) used by Google
        - 340 million parameters, weights and biases, the model uses during training to predict human text patterns
        - Used to interpret complex search queries
-  **2018:** OpenAI released GPT-1
-  **2019:** OpenAI released GPT-2 - caught the public's attention
-  **2020:** OpenAI released, a 175-billion parameter model, GPT-3
-  **2022:** OpenAI released ChatGPT
-  **2022:** Open-source LLMs "BLOOM" released by BigScience Responsible AI License (RAIL) and "Llama" by Meta
    - Not considered truly open source as their license do not meet the criteria defined by the open‑source initiative in its open‑source definition.
        - Discriminates against certain groups and fields
        - License provisioning maxed at 700 million users

---

### id5YbIkupDYh

> [!summary] Cumulative Summary
> It took ~6 years, from research to commercial development, for the LLM community to develop its own open-source model to work with.

<!-- blockquote separator -->

> [!quote]
> Models following more permissive licenses such as the Apache license started to emerge such as Mixtral AI's models, Mixtral 7B and Mixtral 8x7B.

<!-- blockquote separator -->

> [!note] Marginalia / Reflection
> Better licensed models, under the Apache license, were the Mixtral AI's models: "Mixtral 7B" and "Mixtral 8x7B"

---

### idEiTwjWe0Js

> [!quote]
> As commercial players like OpenAI, Anthropic, and Google continued to release increasingly powerful but closed models, the open‑source community responded with alternatives that quickly caught up in quality.

<!-- blockquote separator -->

> [!note] Marginalia / Reflection
> _I just liked the words_

---

### idAVBIER2nMN

> [!quote]
> Important to mention is that Google not only released Gemini, which is a closed‑source model, but they released a family of open‑source models too, called Gemma. These models are designed for text, image, and multimodal generation tasks.

<!-- blockquote separator -->

> [!note] Marginalia / Reflection
> [Gemma-3](https://deepmind.google/models/gemma/) is:
> - **Mutimodal:** text and image generation tasks
> - Supports 140 languages
> - Large context windows up to 128K
> - Function calling ability

---

### idMUp47A66P5

> [!quote]
> Qwen from Alibaba Cloud has rapidly become a leader thanks to its powerful architecture and support for dozens of languages. The latest Qwen models use a mixture of experts architecture, which means that only a subset of the model's parameters are activated for any given prompt. This results in faster inference, reduced memory usage, and more specialized responses. Qwen shines at coding, math, long context retrieval, and its Apache style licensing opens doors for both academics and businesses.

<!-- blockquote separator -->

> [!note] Marginalia / Reflection
> [Qwuen](https://www.alibabacloud.com/en/solutions/generative-ai/qwen?_p_lc=1)
> 
> - **Mixture-of-experts architecture:** uses only a subset of the model's parameters for any given prompt
> - Fast interface
> - Reduced memory usage
> - Good at coding, math, long context retrieval
> - Apache license

---

### ida4Kgzk0ef1

> [!quote]
> DeepSeek AI has made waves with its own models like DeepSeek v3. These models activate only the most relevant parameters for each task, such as 37 billion out of 671 billion, making them far more efficient than traditional models that use every parameter at every step. DeepSeek excels in coding and reasoning and leverages an MIT license to allow near unrestricted deployment and innovation.

<!-- blockquote separator -->

> [!note] Marginalia / Reflection
> [DeepSeek](https://www.deepseek.com/en/):
> 
> - **Mixture-of-Experts architecture:** activate only the most relevant parameters for each task (e.g. 37 billion out of 671 billion); as a result is far more efficient than traditional models that use every parameter at every step
> - Good at coding and reasoning
> - MIT license
