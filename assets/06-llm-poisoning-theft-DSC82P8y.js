var e={id:`llm-lifecycle`,h:{en:`Data poisoning, model theft, output handling and securing the AI lifecycle`,hi:`Data poisoning, model theft, output handling aur AI lifecycle ko secure karna`},body:{en:`
<p>Think of a restaurant. Prompt injection, from the last chapter, is a customer shouting confusing orders at the waiter. But a restaurant can also be harmed in the <b>kitchen</b> (someone swaps an ingredient: data poisoning), at the <b>supplier</b> (a bad batch arrives: supply chain), at the <b>serving hatch</b> (a plate goes out without being checked: output handling) or at the <b>back door</b> (someone copies the secret recipe: model theft). Securing AI means covering every stage, not only the conversation.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AI lifecycle risks">
<rect x="10" y="30" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Data</text><text x="65" y="73" text-anchor="middle" class="svg-muted" font-size="12">collect, label</text>
<rect x="137" y="30" width="110" height="56" rx="8" fill="#fde68a"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">Train</text><text x="192" y="73" text-anchor="middle" class="svg-muted" font-size="12">fine-tune</text>
<rect x="264" y="30" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="319" y="55" text-anchor="middle" class="svg-ink" font-size="13">Model hub</text><text x="319" y="73" text-anchor="middle" class="svg-muted" font-size="12">registry</text>
<rect x="391" y="30" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="446" y="55" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="446" y="73" text-anchor="middle" class="svg-muted" font-size="12">RAG, tools</text>
<rect x="518" y="30" width="112" height="56" rx="8" fill="#fed7aa"/><text x="574" y="55" text-anchor="middle" class="svg-ink" font-size="13">Runtime</text><text x="574" y="73" text-anchor="middle" class="svg-muted" font-size="12">prompts, output</text>
<line x1="120" y1="58" x2="137" y2="58" stroke="#64748b" stroke-width="2"/><line x1="247" y1="58" x2="264" y2="58" stroke="#64748b" stroke-width="2"/><line x1="374" y1="58" x2="391" y2="58" stroke="#64748b" stroke-width="2"/><line x1="501" y1="58" x2="518" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="65" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM04</text><text x="192" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM04</text><text x="319" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM03</text><text x="446" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM06, 08</text><text x="574" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM01, 02, 05</text>
<text x="65" y="138" text-anchor="middle" class="svg-muted" font-size="12">poisoning</text><text x="192" y="138" text-anchor="middle" class="svg-muted" font-size="12">backdoors</text><text x="319" y="138" text-anchor="middle" class="svg-muted" font-size="12">supply chain</text><text x="446" y="138" text-anchor="middle" class="svg-muted" font-size="12">agency, vectors</text><text x="574" y="138" text-anchor="middle" class="svg-muted" font-size="12">injection, leaks</text>
<rect x="10" y="165" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Across all stages: LLM10 unbounded consumption and model extraction</text>
</svg><p class="cap">Each OWASP LLM risk belongs to a stage of the AI lifecycle; controls must exist at every stage.</p></div>

<h3>Data and model poisoning (LLM04)</h3>
<p><b>Poisoning</b> means manipulating the data a model learns from, during pre-training, fine-tuning or when building embeddings, so that it behaves badly. Two forms matter to defenders:</p>
<ul><li><b>Degradation or bias</b>: enough wrong examples make the model give wrong answers on a topic, for example classifying a malware family as benign.</li><li><b>Backdoors</b>: the model behaves normally until a specific trigger word or pattern appears, then does what the attacker planted. Backdoors are hard to find with normal testing.</li></ul>
<p><b>Indicators</b>: sudden drops in evaluation scores, strange behaviour only on certain inputs, training data from unverified public sources, unexplained changes in a dataset. <b>Controls</b>: vetted and versioned data sources, data provenance records, anomaly detection on training data, red-team evaluation before release, and the ability to roll back to a known-good model.</p>

<h3>Supply chain (LLM03)</h3>
<p>Most companies do not train models from scratch; they download base models, adapters (such as LoRA files), datasets and plug-ins from public hubs. Any of these can be tampered with, and some model file formats can even run code when loaded. <b>Controls</b>: download only from trusted publishers, verify signatures and hashes, scan model files, prefer safe formats, keep an <b>AI-BOM</b> (a software bill of materials for AI: which model, which version, which data) and apply the same vendor-risk process you use for software.</p>

<h3>Model theft and extraction (LLM10, formerly its own item)</h3>
<p>A trained model is valuable intellectual property. It can be stolen directly (weights copied from a storage bucket or a leaked backup) or <b>extracted</b> indirectly by sending huge numbers of queries and training a copycat from the answers. <b>Unbounded consumption</b> also covers attackers running up the bill or exhausting capacity with very large or very many requests. <b>Controls</b>: strong access control and encryption on model storage, API authentication, per-user rate limits and quotas, monitoring for systematic query patterns, and budget alerts.</p>

<h3>Improper output handling (LLM05)</h3>
<p>If model output is placed straight into a web page, a shell command or a SQL query, then everything from chapter 2 returns. The model becomes a way to deliver XSS or command injection, because an attacker who can influence the model's input can influence its output.</p>
<div class="eg"><p><b>Worked example.</b> A helpdesk portal shows the assistant's answer inside the page as raw HTML. A user reports that a summary "flashed" and then their session was logged out on another device. The review finds the answer contained a script tag that came from a poisoned knowledge-base article.</p>
<pre class="code"><span class="c"># UNSAFE: model output inserted as HTML</span>
panel.innerHTML = answer

<span class="c"># SAFE: treat output as text, or sanitise with an allow-list</span>
panel.textContent = answer</pre>
<p>Classification: <b>LLM05 improper output handling</b>, enabled by <b>LLM08</b> (poisoned document in the vector store). Fix both: encode output like any user input, and validate what enters the knowledge base.</p></div>

<h3>Sensitive disclosure, vectors and misinformation</h3>
<ul>
<li><b>LLM02 Sensitive information disclosure</b>: the model reveals personal data, secrets or confidential documents. Controls: minimise data given to the model, DLP on prompts and answers, retrieval that respects each user's permissions.</li>
<li><b>LLM08 Vector and embedding weaknesses</b>: a shared vector store lets one department's documents appear in another's answers, or accepts poisoned documents. Controls: per-user or per-tenant access control on retrieval, validation of ingested content.</li>
<li><b>LLM09 Misinformation</b>: confident but wrong answers ("hallucinations"), for example a made-up software package name that an attacker later registers. Controls: grounding with RAG, citations, human review for important decisions.</li>
</ul>

<h3>Frameworks and Cisco tooling</h3>
<p><b>MITRE ATLAS</b> is the ATT&amp;CK-style knowledge base of adversary tactics against AI systems. The <b>NIST AI Risk Management Framework</b> (govern, map, measure, manage) structures AI risk at the organisation level. On the Cisco side, <b>AI Defense</b> discovers AI apps in use, validates models with automated red-teaming and enforces runtime guardrails, and <b>Secure Access</b> controls employee use of public AI apps with DLP and AI guardrails.</p>

<div class="warn"><p><b>Common mistake.</b> Testing an AI app only for good answers. Security testing must also try hostile inputs, poisoned documents and misuse of tools, and must include the data pipeline and the model files, not just the chat window.</p></div>

<div class="exam"><p><b>Exam traps.</b> Manipulated training data = <b>poisoning</b> (LLM04), not prompt injection. Copying a model through many queries = <b>model extraction</b>, grouped under unbounded consumption in 2025 and called Model Theft in 2023. Output shown as raw HTML = <b>improper</b> (formerly insecure) output handling.</p></div>

<div class="scn"><h4>The helpful fine-tune</h4><p>A security team fine-tuned a model to classify phishing reports using a public dataset plus their own tickets. After release, messages containing one particular marketing phrase were always rated "safe". Investigation found that a few hundred records in the public dataset paired that phrase with "legitimate". The team removed the dataset, retrained from their own verified data, added a holdout test set with known phishing samples, and recorded dataset hashes in the AI-BOM.</p><p><b>Lesson:</b> training data is part of your attack surface; verify it and keep a way to roll back.</p></div>

<div class="iv"><p class="q">"Besides prompt injection, what risks would you check in a company's new LLM application?"</p><p>Walk the lifecycle: data poisoning and provenance, supply chain of models and plug-ins, excessive agency of tools, access control in the RAG store, improper output handling into web pages or shells, sensitive data disclosure, model theft and cost abuse through rate limits. Mention OWASP LLM Top 10 and MITRE ATLAS as frameworks and say you would add AI guardrails and logging at runtime.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AI risks live across the lifecycle: data, training, model supply, deployment, runtime.</li>
<li>Poisoning manipulates training data (bias or hidden backdoors); defend with provenance, evaluation and rollback.</li>
<li>Model theft or extraction: protect weights, authenticate and rate-limit the API, monitor query patterns.</li>
<li>Improper output handling turns the model into an injection vector; encode and validate outputs.</li>
<li>Use OWASP LLM Top 10, MITRE ATLAS and NIST AI RMF; Cisco AI Defense and Secure Access guardrails enforce controls.</li>
</ul></div>
`,hi:`
<p>Ek restaurant socho. Pichhle chapter ka prompt injection ek customer hai jo waiter par confusing orders chilla raha hai. Par restaurant ko <b>kitchen</b> mein bhi nuksaan ho sakta hai (koi ingredient badal de: data poisoning), <b>supplier</b> par (kharaab batch aa jaaye: supply chain), <b>serving hatch</b> par (plate bina check bahar chali jaaye: output handling) ya <b>back door</b> par (koi secret recipe copy kar le: model theft). AI ko secure karna matlab har stage cover karna, sirf conversation nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="AI lifecycle risks">
<rect x="10" y="30" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Data</text><text x="65" y="73" text-anchor="middle" class="svg-muted" font-size="12">collect, label</text>
<rect x="137" y="30" width="110" height="56" rx="8" fill="#fde68a"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">Train</text><text x="192" y="73" text-anchor="middle" class="svg-muted" font-size="12">fine-tune</text>
<rect x="264" y="30" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="319" y="55" text-anchor="middle" class="svg-ink" font-size="13">Model hub</text><text x="319" y="73" text-anchor="middle" class="svg-muted" font-size="12">registry</text>
<rect x="391" y="30" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="446" y="55" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="446" y="73" text-anchor="middle" class="svg-muted" font-size="12">RAG, tools</text>
<rect x="518" y="30" width="112" height="56" rx="8" fill="#fed7aa"/><text x="574" y="55" text-anchor="middle" class="svg-ink" font-size="13">Runtime</text><text x="574" y="73" text-anchor="middle" class="svg-muted" font-size="12">prompts, output</text>
<line x1="120" y1="58" x2="137" y2="58" stroke="#64748b" stroke-width="2"/><line x1="247" y1="58" x2="264" y2="58" stroke="#64748b" stroke-width="2"/><line x1="374" y1="58" x2="391" y2="58" stroke="#64748b" stroke-width="2"/><line x1="501" y1="58" x2="518" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="65" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM04</text><text x="192" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM04</text><text x="319" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM03</text><text x="446" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM06, 08</text><text x="574" y="118" text-anchor="middle" class="svg-accent" font-size="12">LLM01, 02, 05</text>
<text x="65" y="138" text-anchor="middle" class="svg-muted" font-size="12">poisoning</text><text x="192" y="138" text-anchor="middle" class="svg-muted" font-size="12">backdoors</text><text x="319" y="138" text-anchor="middle" class="svg-muted" font-size="12">supply chain</text><text x="446" y="138" text-anchor="middle" class="svg-muted" font-size="12">agency, vectors</text><text x="574" y="138" text-anchor="middle" class="svg-muted" font-size="12">injection, leaks</text>
<rect x="10" y="165" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Har stage par: LLM10 unbounded consumption aur model extraction</text>
</svg><p class="cap">Har OWASP LLM risk AI lifecycle ke kisi stage ka hai; controls har stage par hone chahiye.</p></div>

<h3>Data aur model poisoning (LLM04)</h3>
<p><b>Poisoning</b> ka matlab us data ko manipulate karna jisse model seekhta hai, pre-training, fine-tuning ya embeddings banate waqt, taaki woh galat behave kare. Defenders ke liye do roop matter karte hain:</p>
<ul><li><b>Degradation ya bias</b>: kaafi galat examples model se kisi topic par galat jawab dilwate hain, jaise ek malware family ko benign classify karna.</li><li><b>Backdoors</b>: model normal behave karta hai jab tak koi specific trigger word ya pattern na aaye, phir woh karta hai jo attacker ne plant kiya. Normal testing se backdoors dhoondhna mushkil hai.</li></ul>
<p><b>Indicators</b>: evaluation scores mein achanak girawat, sirf kuch inputs par ajeeb behaviour, unverified public sources se training data, dataset mein bina wajah badlaav. <b>Controls</b>: vetted aur versioned data sources, data provenance records, training data par anomaly detection, release se pehle red-team evaluation, aur known-good model par rollback karne ki kshamta.</p>

<h3>Supply chain (LLM03)</h3>
<p>Zyada tar companies models shuru se train nahi karti; woh public hubs se base models, adapters (jaise LoRA files), datasets aur plug-ins download karti hain. Inmein se koi bhi tamper ho sakta hai, aur kuch model file formats load hote waqt code bhi chala sakte hain. <b>Controls</b>: sirf trusted publishers se download, signatures aur hashes verify karo, model files scan karo, safe formats prefer karo, ek <b>AI-BOM</b> rakho (AI ke liye software bill of materials: kaunsa model, kaunsa version, kaunsa data) aur wahi vendor-risk process lagao jo software ke liye lagate ho.</p>

<h3>Model theft aur extraction (LLM10, pehle alag item)</h3>
<p>Trained model qeemti intellectual property hai. Use seedha chura sakte hain (storage bucket ya leaked backup se weights copy) ya indirectly <b>extract</b> kar sakte hain, bahut saari queries bhejkar aur jawabon se copycat train karke. <b>Unbounded consumption</b> mein woh attackers bhi aate hain jo bahut bade ya bahut zyada requests se bill badhate ya capacity khatam karte hain. <b>Controls</b>: model storage par strong access control aur encryption, API authentication, per-user rate limits aur quotas, systematic query patterns ki monitoring, aur budget alerts.</p>

<h3>Improper output handling (LLM05)</h3>
<p>Agar model output seedha web page, shell command ya SQL query mein daala jaata hai, to chapter 2 ka sab kuch wapas aa jaata hai. Model XSS ya command injection pahunchane ka zariya ban jaata hai, kyunki jo attacker model ka input influence kar sakta hai woh uska output bhi influence kar sakta hai.</p>
<div class="eg"><p><b>Worked example.</b> Ek helpdesk portal assistant ka jawab page ke andar raw HTML ki tarah dikhata hai. Ek user report karta hai ki summary "flash" hui aur phir doosre device par uska session logout ho gaya. Review mein pata chalta hai ki jawab mein ek script tag tha jo ek poisoned knowledge-base article se aaya tha.</p>
<pre class="code"><span class="c"># UNSAFE: model output HTML ki tarah daala gaya</span>
panel.innerHTML = answer

<span class="c"># SAFE: output ko text maano, ya allow-list se sanitise karo</span>
panel.textContent = answer</pre>
<p>Classification: <b>LLM05 improper output handling</b>, jise <b>LLM08</b> (vector store mein poisoned document) ne sambhav banaya. Dono fix karo: output ko kisi bhi user input ki tarah encode karo, aur knowledge base mein kya aata hai use validate karo.</p></div>

<h3>Sensitive disclosure, vectors aur misinformation</h3>
<ul>
<li><b>LLM02 Sensitive information disclosure</b>: model personal data, secrets ya confidential documents bata deta hai. Controls: model ko diya data minimum rakho, prompts aur jawabon par DLP, retrieval jo har user ki permissions maane.</li>
<li><b>LLM08 Vector aur embedding weaknesses</b>: shared vector store ek department ke documents doosre ke jawabon mein dikha deta hai, ya poisoned documents accept kar leta hai. Controls: retrieval par per-user ya per-tenant access control, ingest hone wale content ka validation.</li>
<li><b>LLM09 Misinformation</b>: confident par galat jawab ("hallucinations"), jaise ek banaya hua software package naam jise attacker baad mein register kar le. Controls: RAG se grounding, citations, important decisions ke liye human review.</li>
</ul>

<h3>Frameworks aur Cisco tooling</h3>
<p><b>MITRE ATLAS</b> AI systems ke khilaaf adversary tactics ka ATT&amp;CK-style knowledge base hai. <b>NIST AI Risk Management Framework</b> (govern, map, measure, manage) organisation level par AI risk ko structure deta hai. Cisco ki taraf, <b>AI Defense</b> use ho rahe AI apps discover karta hai, automated red-teaming se models validate karta hai aur runtime guardrails enforce karta hai, aur <b>Secure Access</b> employees ke public AI apps ke use ko DLP aur AI guardrails se control karta hai.</p>

<div class="warn"><p><b>Common galti.</b> AI app ko sirf achhe jawabon ke liye test karna. Security testing mein hostile inputs, poisoned documents aur tools ka misuse bhi try karna hota hai, aur data pipeline aur model files bhi shaamil karni hoti hain, sirf chat window nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Manipulated training data = <b>poisoning</b> (LLM04), prompt injection nahi. Bahut saari queries se model copy karna = <b>model extraction</b>, 2025 mein unbounded consumption ke andar aur 2023 mein Model Theft kehlata tha. Raw HTML ki tarah dikhaya output = <b>improper</b> (pehle insecure) output handling.</p></div>

<div class="scn"><h4>Madadgaar fine-tune</h4><p>Ek security team ne ek public dataset aur apne tickets se phishing reports classify karne ke liye model fine-tune kiya. Release ke baad ek khaas marketing phrase wale messages hamesha "safe" rate hote the. Investigation mein mila ki public dataset ke kuch sau records us phrase ko "legitimate" ke saath jodte the. Team ne dataset hataya, apne verified data se dobara train kiya, known phishing samples ke saath holdout test set joda, aur dataset hashes AI-BOM mein record kiye.</p><p><b>Seekh:</b> training data aapke attack surface ka hissa hai; use verify karo aur rollback ka raasta rakho.</p></div>

<div class="iv"><p class="q">"Prompt injection ke alawa, company ki nayi LLM application mein aap kaunse risks check karoge?"</p><p>Lifecycle par chalo: data poisoning aur provenance, models aur plug-ins ki supply chain, tools ki excessive agency, RAG store mein access control, web pages ya shells mein improper output handling, sensitive data disclosure, model theft aur rate limits se cost abuse. Frameworks ke roop mein OWASP LLM Top 10 aur MITRE ATLAS mention karo aur kaho ki runtime par AI guardrails aur logging jodoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AI risks poore lifecycle mein hain: data, training, model supply, deployment, runtime.</li>
<li>Poisoning training data manipulate karta hai (bias ya chhupe backdoors); provenance, evaluation aur rollback se defend karo.</li>
<li>Model theft ya extraction: weights protect karo, API authenticate aur rate-limit karo, query patterns monitor karo.</li>
<li>Improper output handling model ko injection vector bana deta hai; outputs encode aur validate karo.</li>
<li>OWASP LLM Top 10, MITRE ATLAS aur NIST AI RMF use karo; Cisco AI Defense aur Secure Access guardrails controls enforce karte hain.</li>
</ul></div>
`}};export{e as default};