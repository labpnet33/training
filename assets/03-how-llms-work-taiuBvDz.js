var e={id:`llms`,h:{en:`How LLMs work: tokens, context window, training, inference, temperature`,hi:`LLMs kaise kaam karte hain: tokens, context window, training, inference, temperature`},body:{en:`
<p>Your phone keyboard suggests the next word as you type "see you" and offers "tomorrow". It learned that from lots of text. A <b>large language model (LLM)</b> is that idea scaled up enormously: a deep neural network with billions of parameters, trained on a huge amount of text and code, that predicts what comes next so well that it can write explanations, configs and summaries. You do not need the maths, but you do need five practical ideas, because each one explains a real behaviour you will see in the NOC.</p>

<h3>1. Tokens: how the model sees text</h3>
<p>An LLM does not read letters or whole words. Text is split into <b>tokens</b>: common words are one token, rarer words and symbols are split into pieces. In English a token averages roughly three quarters of a word. Network text is token-hungry: an interface name like <code>GigabitEthernet0/1</code>, an IPv6 address or a hex MAC address breaks into many tokens. Tokens matter because prices, speed and limits are all counted in tokens.</p>

<h3>2. Next-token prediction</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="LLM generation loop">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Prompt text</text>
<rect x="160" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Tokens</text>
<rect x="290" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="355" y="42" text-anchor="middle" class="svg-ink" font-size="13">Model</text><text x="355" y="60" text-anchor="middle" class="svg-muted" font-size="12">weights fixed</text>
<rect x="450" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="13">Next-token odds</text><text x="540" y="60" text-anchor="middle" class="svg-muted" font-size="12">pick one (temperature)</text>
<line x1="130" y1="45" x2="160" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<path d="M540 70 L540 120 L210 120 L210 70" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="375" y="145" text-anchor="middle" class="svg-muted" font-size="12">append the chosen token and repeat until the answer is complete</text>
</svg><p class="cap">An LLM writes one token at a time, each chosen from a probability list.</p></div>
<p>At every step the model calculates a probability for every possible next token, picks one, adds it to the text, and repeats. It is predicting <b>plausible</b> text, not looking facts up in a database. This is the root of <b>hallucination</b>: when the model lacks the facts, the most plausible-sounding continuation can still be wrong, and it is delivered in the same fluent style.</p>

<h3>3. The context window: the model's working memory</h3>
<p>The <b>context window</b> is the maximum number of tokens the model can consider at once: the hidden instructions from the tool (system prompt), the conversation so far, anything you paste (logs, configs), tool results, and the answer it is writing. Anything outside the window simply does not exist for the model. Long windows help, but models can pay less attention to details buried in the middle of a huge paste, and every token costs time and money.</p>

<div class="eg"><p><b>Worked example.</b> You want a summary of an overnight syslog file with 4,000 lines. At about 25 tokens per line that is roughly 100,000 tokens. A tool with a 32,000-token window cannot even see it; a larger window can, but the summary may miss a single important line. The engineer's move: filter first. Keep only severity 0 to 4 messages, or grep for <code>%OSPF-5-ADJCHG</code>, <code>%LINK-3-UPDOWN</code> and <code>%LINEPROTO-5-UPDOWN</code>, then ask the model to summarise 300 relevant lines. Smaller, cleaner input gives a better answer.</p></div>

<h3>4. Training versus inference</h3>
<table class="cmp"><tr><th></th><th>Training</th><th>Inference</th></tr>
<tr><td>What happens</td><td>Parameters are adjusted using huge datasets (pre-training), then refined with examples and human feedback (fine-tuning, RLHF)</td><td>The finished model answers your prompt; parameters do not change</td></tr>
<tr><td>How often</td><td>Rarely; weeks and very large compute</td><td>Every time anyone asks a question</td></tr>
<tr><td>Consequence</td><td>Knowledge stops at a <b>training cutoff</b> date</td><td>The model does not learn your network from chatting; it only sees what is in the context window</td></tr>
</table>
<p>Two practical results. First, the model does not know your topology, last night's change or a software release newer than its cutoff unless you or a tool put that information into the context. Second, correcting it in one chat does not permanently fix it; next conversation it starts fresh. Products may add memory or search features, but the model's weights stay the same.</p>

<h3>5. Temperature: how adventurous the choice is</h3>
<p><b>Temperature</b> controls how the next token is picked from the probability list. Low temperature (near 0) almost always takes the most likely token: answers are focused and more repeatable. High temperature gives lower-probability tokens more chance: answers are more varied and creative, and more likely to wander.</p>
<pre class="out">Prompt so far: "router ospf"
next-token probabilities (illustration)
  " 1"     0.61   <span class="hl">&lt;- temperature 0 picks this every time</span>
  " 10"    0.18
  " 100"   0.09
  " 65535" 0.02</pre>
<p>For configs, command explanations and log analysis, use low temperature. For brainstorming names, training quiz questions or alternative designs, higher is fine. Low temperature makes the model consistent, <b>not correct</b>: a wrong answer repeated reliably is still wrong.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing the model "knows" your network. Pasting an entire 200 MB log and trusting the summary. Thinking temperature 0 removes hallucinations. Assuming a correction in one chat trains the model for everyone.</p></div>
<div class="exam"><p><b>Exam trap.</b> Training changes the model's parameters; inference does not. The context window is measured in tokens and includes both input and output. Temperature controls randomness, not accuracy or knowledge.</p></div>

<div class="scn"><h4>The command that did not exist</h4><p>An engineer asked an assistant for the command to show optical power on a new switch model released after the model's training cutoff. The assistant produced a neat command with realistic-looking output. The command was rejected by the switch with "% Invalid input detected". The model had blended syntax from two older platforms. The engineer checked the vendor's command reference for that software release and found the correct command in two minutes.</p><p><b>Lesson:</b> the model predicts plausible text from what it saw in training. For new platforms and versions, ground it with the real documentation or the device itself.</p></div>

<div class="iv"><p class="q">"Why does an LLM sometimes invent a command that does not exist?"</p><p>Strong answer: an LLM generates text token by token by predicting the most plausible continuation; it has no built-in database of your platform's commands. If the training data is thin, mixed across platforms, or older than the software you run, the plausible answer can be wrong but still fluent. Mention the training cutoff, the context window (it only knows what you gave it), and the fix: grounding with documentation or live device output, low temperature, and testing in a lab before production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLMs split text into tokens and generate one token at a time by predicting the most plausible next token.</li>
<li>The context window is the model's working memory in tokens; filter logs before pasting.</li>
<li>Training changes weights and sets a knowledge cutoff; inference uses fixed weights and learns nothing permanent.</li>
<li>Temperature controls randomness: low for configs and analysis, higher for brainstorming.</li>
<li>Plausible is not the same as true: that gap is where hallucinations live.</li>
</ul></div>
`,hi:`
<p>Jab aap "see you" type karte ho to aapka phone keyboard agla word "tomorrow" suggest karta hai. Usne yeh bahut saare text se seekha. <b>Large language model (LLM)</b> isi idea ka bahut bada version hai: billions of parameters wala deep neural network, jo bahut zyada text aur code par trained hai, aur itni achhi tarah predict karta hai ki aage kya aayega ki woh explanations, configs aur summaries likh sakta hai. Maths ki zaroorat nahi, lekin paanch practical ideas zaroori hain, kyunki har ek NOC mein dikhne wala ek real behaviour samjhata hai.</p>

<h3>1. Tokens: model text ko kaise dekhta hai</h3>
<p>LLM letters ya poore words nahi padhta. Text <b>tokens</b> mein toot jaata hai: common words ek token hote hain, rare words aur symbols tukdon mein toot jaate hain. English mein ek token average lagbhag teen-chauthai word hota hai. Network text bahut tokens khaata hai: <code>GigabitEthernet0/1</code> jaisa interface name, IPv6 address ya hex MAC address kai tokens mein toot jaata hai. Tokens isliye matter karte hain kyunki price, speed aur limits sab tokens mein gine jaate hain.</p>

<h3>2. Next-token prediction</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="LLM generation loop">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Prompt text</text>
<rect x="160" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Tokens</text>
<rect x="290" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="355" y="42" text-anchor="middle" class="svg-ink" font-size="13">Model</text><text x="355" y="60" text-anchor="middle" class="svg-muted" font-size="12">weights fixed</text>
<rect x="450" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="13">Next-token odds</text><text x="540" y="60" text-anchor="middle" class="svg-muted" font-size="12">ek chuno (temperature)</text>
<line x1="130" y1="45" x2="160" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="420" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<path d="M540 70 L540 120 L210 120 L210 70" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="375" y="145" text-anchor="middle" class="svg-muted" font-size="12">chuna hua token jodo aur jawab poora hone tak repeat karo</text>
</svg><p class="cap">LLM ek baar mein ek token likhta hai, har token probability list se chuna jaata hai.</p></div>
<p>Har step par model har possible next token ki probability calculate karta hai, ek chunta hai, text mein jodta hai, aur repeat karta hai. Woh <b>plausible</b> text predict kar raha hai, kisi database mein facts nahi dhoondh raha. Yahi <b>hallucination</b> ki jad hai: jab model ke paas facts nahi hote, sabse plausible lagne wala continuation bhi galat ho sakta hai, aur woh usi fluent style mein diya jaata hai.</p>

<h3>3. Context window: model ki working memory</h3>
<p><b>Context window</b> tokens ki woh maximum sankhya hai jise model ek saath consider kar sakta hai: tool ke hidden instructions (system prompt), ab tak ki conversation, jo kuch aap paste karte ho (logs, configs), tool results, aur jo jawab woh likh raha hai. Window ke bahar ki koi bhi cheez model ke liye exist hi nahi karti. Lambi windows madad karti hain, lekin bade paste ke beech mein dabi details par model kam dhyan de sakta hai, aur har token time aur paisa leta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko raat ki 4,000 lines wali syslog file ka summary chahiye. Lagbhag 25 tokens per line ke hisaab se yeh around 100,000 tokens hain. 32,000-token window wala tool ise dekh bhi nahi sakta; badi window wala dekh sakta hai, lekin summary ek important line miss kar sakti hai. Engineer ka move: pehle filter karo. Sirf severity 0 se 4 wale messages rakho, ya <code>%OSPF-5-ADJCHG</code>, <code>%LINK-3-UPDOWN</code> aur <code>%LINEPROTO-5-UPDOWN</code> ke liye grep karo, phir model se 300 relevant lines summarise karwao. Chhota, saaf input behtar jawab deta hai.</p></div>

<h3>4. Training versus inference</h3>
<table class="cmp"><tr><th></th><th>Training</th><th>Inference</th></tr>
<tr><td>Kya hota hai</td><td>Bade datasets se parameters adjust hote hain (pre-training), phir examples aur human feedback se refine hote hain (fine-tuning, RLHF)</td><td>Tayyar model aapke prompt ka jawab deta hai; parameters nahi badalte</td></tr>
<tr><td>Kitni baar</td><td>Kabhi-kabhi; hafte aur bahut zyada compute</td><td>Har baar jab koi sawaal poochta hai</td></tr>
<tr><td>Nateeja</td><td>Knowledge ek <b>training cutoff</b> date par ruk jaati hai</td><td>Model chat karke aapka network nahi seekhta; woh sirf wahi dekhta hai jo context window mein hai</td></tr>
</table>
<p>Do practical nateeje. Pehla, model ko aapki topology, kal raat ka change ya cutoff se naya software release tab tak pata nahi jab tak aap ya koi tool woh information context mein na daale. Doosra, ek chat mein use correct karne se woh permanently theek nahi hota; agli conversation mein woh fresh shuru karta hai. Products memory ya search features jod sakte hain, lekin model ke weights wahi rehte hain.</p>

<h3>5. Temperature: choice kitni adventurous hai</h3>
<p><b>Temperature</b> control karta hai ki probability list se next token kaise chuna jaaye. Low temperature (0 ke paas) lagbhag hamesha sabse likely token leta hai: jawab focused aur zyada repeatable hote hain. High temperature kam probability wale tokens ko zyada mauka deta hai: jawab zyada varied aur creative hote hain, aur bhatakne ke chances bhi zyada.</p>
<pre class="out">Prompt so far: "router ospf"
next-token probabilities (illustration)
  " 1"     0.61   <span class="hl">&lt;- temperature 0 har baar ise chunega</span>
  " 10"    0.18
  " 100"   0.09
  " 65535" 0.02</pre>
<p>Configs, command explanations aur log analysis ke liye low temperature use karo. Names brainstorm karne, training quiz questions ya alternative designs ke liye higher theek hai. Low temperature model ko consistent banata hai, <b>correct nahi</b>: reliably repeat hone wala galat jawab bhi galat hi hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki model aapka network "jaanta" hai. Poora 200 MB log paste karke summary par trust karna. Sochna ki temperature 0 hallucinations khatam kar deta hai. Yeh maanna ki ek chat mein correction se model sabke liye train ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Training model ke parameters badalti hai; inference nahi. Context window tokens mein naapi jaati hai aur usmein input aur output dono aate hain. Temperature randomness control karta hai, accuracy ya knowledge nahi.</p></div>

<div class="scn"><h4>Woh command jo exist hi nahi karti thi</h4><p>Ek engineer ne assistant se ek naye switch model par optical power dekhne ki command poochi, jo model ke training cutoff ke baad release hua tha. Assistant ne ek saaf command aur realistic dikhne wala output de diya. Switch ne command ko "% Invalid input detected" ke saath reject kar diya. Model ne do purane platforms ka syntax mila diya tha. Engineer ne us software release ka vendor command reference check kiya aur do minute mein sahi command mil gayi.</p><p><b>Seekh:</b> model training mein dekhe gaye text se plausible text predict karta hai. Naye platforms aur versions ke liye use real documentation ya device se ground karo.</p></div>

<div class="iv"><p class="q">"LLM kabhi-kabhi aisi command kyun bana deta hai jo exist hi nahi karti?"</p><p>Strong answer: LLM sabse plausible continuation predict karke token by token text generate karta hai; uske paas aapke platform ki commands ka built-in database nahi hai. Agar training data kam hai, platforms mein mixed hai, ya aapke software se purana hai, to plausible jawab galat lekin fluent ho sakta hai. Training cutoff, context window (use sirf wahi pata hai jo aapne diya) aur fix ka zikr karo: documentation ya live device output se grounding, low temperature, aur production se pehle lab mein testing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LLMs text ko tokens mein todte hain aur sabse plausible next token predict karke ek baar mein ek token generate karte hain.</li>
<li>Context window tokens mein model ki working memory hai; paste karne se pehle logs filter karo.</li>
<li>Training weights badalti hai aur knowledge cutoff set karti hai; inference fixed weights use karta hai aur kuch permanent nahi seekhta.</li>
<li>Temperature randomness control karta hai: configs aur analysis ke liye low, brainstorming ke liye higher.</li>
<li>Plausible aur true ek cheez nahi hai: isi gap mein hallucinations rehti hain.</li>
</ul></div>
`}};export{e as default};