var e={id:`big-picture`,h:{en:`The big picture: AI in network operations`,hi:`Big picture: network operations mein AI`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain the difference between AI, machine learning, deep learning and generative AI; describe supervised, unsupervised and reinforcement learning with network examples; explain how a large language model (LLM) works at a practical level (tokens, context window, training versus inference, temperature); describe what predictive, generative and agentic AI do in a network operations centre (NOC); name the main AIOps use cases; write useful prompts for network tasks; list the risks (hallucination, data leakage, prompt injection, bias); design guardrails with a human in the loop; and, most important of all, <b>verify AI output like an engineer</b> before anything touches production.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing, single-area OSPF and the usual show commands (<code>show ip interface brief</code>, <code>show ip ospf neighbor</code>, <code>show interfaces</code>). It helps to have done the syslog/SNMP module and the previous module on management models, REST APIs, JSON and Ansible, because AI tools consume exactly that kind of data and call exactly that kind of API. No maths beyond averages is needed, and no programming.</p>

<h3>Start with an analogy: the brilliant new intern</h3>
<p>Imagine your NOC hires a new intern. This intern has read every vendor manual, every RFC and every forum thread ever written. They type at a thousand words a minute, never get tired, and answer every question instantly and confidently. But they have <b>never seen your network</b>, they do not know about last night's change, and now and then they state something completely wrong in the same calm, confident voice they use when they are right.</p>
<p>Would you give this intern the enable password on day one? Of course not. You would let them read logs, summarise tickets and draft configs, and you would review everything before it reached a router. Over months, as they prove themselves, you might let them run low-risk changes on their own, inside clear rules. That is exactly the relationship a network engineer should have with AI today. Keep this intern in mind for the whole module.</p>

<h3>The family tree: AI, ML, deep learning, generative AI</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Nested circles: AI contains ML contains deep learning contains generative AI">
<ellipse cx="320" cy="130" rx="305" ry="122" fill="#e2e8f0"/>
<ellipse cx="360" cy="140" rx="230" ry="98" fill="#bae6fd"/>
<ellipse cx="400" cy="150" rx="160" ry="72" fill="#ddd6fe"/>
<ellipse cx="440" cy="158" rx="92" ry="44" fill="#fde68a"/>
<text x="70" y="135" class="svg-ink" font-size="14">AI</text>
<text x="60" y="155" class="svg-muted" font-size="12">rules or learning</text>
<text x="160" y="140" class="svg-ink" font-size="14">Machine learning</text>
<text x="160" y="158" class="svg-muted" font-size="12">learns from data</text>
<text x="265" y="150" class="svg-ink" font-size="14">Deep learning</text>
<text x="265" y="168" class="svg-muted" font-size="12">neural networks</text>
<text x="440" y="155" text-anchor="middle" class="svg-ink" font-size="14">Generative AI</text>
<text x="440" y="173" text-anchor="middle" class="svg-muted" font-size="12">LLMs create text</text>
</svg><p class="cap">Each circle is a subset of the one around it. Every LLM is deep learning, but not all AI is an LLM.</p></div>
<p><b>Artificial intelligence (AI)</b> is the broad goal: software doing tasks that normally need human judgement. It can be built from hand-written rules or from learning. <b>Machine learning (ML)</b> is the part of AI where the software learns patterns from data instead of being given every rule. <b>Deep learning</b> is ML that uses large, many-layered neural networks. <b>Generative AI</b> is deep learning that <i>creates</i> new content (text, code, images). The chat assistants you know are generative AI built on <b>large language models (LLMs)</b>. Chapter 2 unpacks these terms properly.</p>

<h3>Three kinds of AI you will meet in a NOC</h3>
<table class="cmp"><tr><th>Kind</th><th>What it does</th><th>NOC example</th><th>If it is wrong</th></tr>
<tr><td><b>Predictive</b></td><td>Learns from history to forecast or detect deviations</td><td>"Uplink Gi0/1 will reach 90% in three weeks"; an interface far above its baseline</td><td>You waste a little time</td></tr>
<tr><td><b>Generative</b></td><td>Creates text, config or code from a prompt</td><td>Summarise a ticket, explain a syslog message, draft an ACL</td><td>A wrong config can break a site if someone pastes it</td></tr>
<tr><td><b>Agentic</b></td><td>Plans multiple steps and executes them with tools</td><td>Diagnose, propose a fix, log in and apply it</td><td>It breaks the site by itself</td></tr>
</table>
<p>Read the last column carefully. Each step up adds <b>power and risk</b> together. That single idea explains why the second half of this module is about grounding, guardrails, approval gates and verification.</p>

<h3>Why this matters now</h3>
<p>Networks produce far more data than humans can read: syslog, SNMP counters, streaming telemetry, NetFlow, configuration history and tickets. A mid-size enterprise can generate millions of log lines a day. AI helps by correlating that flood into a few incidents, spotting slow trends, and turning plain-English questions into answers. Vendors now ship AI assistants inside their management and assurance platforms, and exams expect you to understand what these tools do and where they fail. Employers want engineers who can use AI to go faster <i>without</i> becoming the person who pasted a hallucinated config into the core router.</p>

<h3>How the labs work</h3>
<p>The labs use <b>NK Copilot</b>, a training assistant that runs on a NOC host. It is deliberately simple and rule-based so that its behaviour is repeatable, but it acts like a real AI assistant: it collects telemetry, lists findings with confidence scores, proposes a numbered plan and can run as an agent. It is right most of the time and <b>confidently wrong</b> some of the time, exactly like the intern. Your job in the labs is to use it, catch its mistake with show commands, and fix the real root cause.</p>
<pre class="code"><span class="c">! typical first commands on the NOC host</span>
NOC&gt; copilot help
NOC&gt; copilot analyze all
NOC&gt; copilot plan
NOC&gt; copilot explain 2</pre>

<div class="warn"><p><b>Common beginner mistake.</b> Treating "AI" as one magic thing. A forecasting model, a chat assistant and an autonomous agent are very different tools with different risks. Always ask: is it predicting, generating or acting?</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI is a subset of deep learning, which is a subset of machine learning, which is a subset of AI. Questions may describe a tool and ask which category it belongs to: creating new text or config means generative; forecasting from history means predictive; taking actions with tools means agentic.</p></div>

<div class="scn"><h4>The 2 a.m. copy-paste</h4><p>A junior engineer on night shift asked a public chat assistant how to stop "OSPF flapping" on a branch router, pasted the suggested commands straight into the router and changed the OSPF timers on one side only. The adjacency, which had been flapping because of a faulty optic, now went down completely and the branch lost connectivity until morning. The review found three problems: the assistant never saw the router's data, the engineer did not verify the suggestion, and nothing stopped an unreviewed change at night.</p><p><b>Lesson:</b> AI is a powerful assistant, not an authority. Evidence first, human approval second, change control always.</p></div>

<div class="iv"><p class="q">"Where do you see AI helping in network operations, and where would you not trust it?"</p><p>Strong answer: separate predictive, generative and agentic uses. Predictive for baselines, anomalies and capacity forecasts; generative for summarising logs and drafting configs or documentation; agentic only inside guardrails (read-only first, approval gates, scope limits, audit logs). Then say plainly that you would never apply an AI suggestion without checking it against show output, because LLMs can hallucinate. Interviewers love a balanced answer: enthusiastic about speed, strict about verification.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AI contains ML, which contains deep learning, which contains generative AI and LLMs.</li>
<li>In a NOC, AI predicts (forecast, anomalies), generates (summaries, drafts) or acts (agents).</li>
<li>Power and risk grow together from predictive to generative to agentic.</li>
<li>Treat an AI assistant like a brilliant new intern: useful, fast, sometimes confidently wrong.</li>
<li>The engineer's core skill becomes verification: evidence before approval.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap AI, machine learning, deep learning aur generative AI ka farak samjha paoge; supervised, unsupervised aur reinforcement learning ko network examples ke saath describe kar paoge; practical level par samjha paoge ki large language model (LLM) kaise kaam karta hai (tokens, context window, training versus inference, temperature); bata paoge ki network operations centre (NOC) mein predictive, generative aur agentic AI kya karte hain; main AIOps use cases ke naam le paoge; network tasks ke liye useful prompts likh paoge; risks list kar paoge (hallucination, data leakage, prompt injection, bias); human in the loop ke saath guardrails design kar paoge; aur sabse important, production ko kuch bhi chhoone se pehle <b>AI output ko engineer ki tarah verify</b> kar paoge.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing, single-area OSPF aur common show commands (<code>show ip interface brief</code>, <code>show ip ospf neighbor</code>, <code>show interfaces</code>) ke saath comfortable hona chahiye. Syslog/SNMP module aur pichhla module (management models, REST APIs, JSON aur Ansible) kiya ho to madad milegi, kyunki AI tools bilkul isi tarah ka data consume karte hain aur isi tarah ki API call karte hain. Averages se zyada maths nahi chahiye, aur programming bhi nahi.</p>

<h3>Ek analogy se shuru karo: brilliant naya intern</h3>
<p>Socho aapke NOC ne ek naya intern hire kiya. Is intern ne har vendor manual, har RFC aur har forum thread padh rakha hai. Woh ek minute mein hazaar words type karta hai, kabhi thakta nahi, aur har sawaal ka jawab turant aur confidence ke saath deta hai. Lekin usne <b>aapka network kabhi dekha nahi</b>, use kal raat ke change ka pata nahi, aur kabhi-kabhi woh bilkul galat baat usi shaant, confident awaaz mein bol deta hai jismein woh sahi baat bolta hai.</p>
<p>Kya aap is intern ko pehle hi din enable password doge? Bilkul nahi. Aap use logs padhne doge, tickets summarise karne doge aur configs draft karne doge, aur router tak kuch bhi pahunchne se pehle sab review karoge. Mahino mein, jaise-jaise woh khud ko prove karta hai, aap use saaf rules ke andar low-risk changes khud chalane de sakte ho. Aaj network engineer ka AI ke saath bilkul yahi rishta hona chahiye. Poore module mein is intern ko yaad rakhna.</p>

<h3>Family tree: AI, ML, deep learning, generative AI</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Nested circles: AI ke andar ML, uske andar deep learning, uske andar generative AI">
<ellipse cx="320" cy="130" rx="305" ry="122" fill="#e2e8f0"/>
<ellipse cx="360" cy="140" rx="230" ry="98" fill="#bae6fd"/>
<ellipse cx="400" cy="150" rx="160" ry="72" fill="#ddd6fe"/>
<ellipse cx="440" cy="158" rx="92" ry="44" fill="#fde68a"/>
<text x="70" y="135" class="svg-ink" font-size="14">AI</text>
<text x="60" y="155" class="svg-muted" font-size="12">rules ya learning</text>
<text x="160" y="140" class="svg-ink" font-size="14">Machine learning</text>
<text x="160" y="158" class="svg-muted" font-size="12">data se seekhta hai</text>
<text x="265" y="150" class="svg-ink" font-size="14">Deep learning</text>
<text x="265" y="168" class="svg-muted" font-size="12">neural networks</text>
<text x="440" y="155" text-anchor="middle" class="svg-ink" font-size="14">Generative AI</text>
<text x="440" y="173" text-anchor="middle" class="svg-muted" font-size="12">LLMs text banate hain</text>
</svg><p class="cap">Har circle apne bahar wale circle ka subset hai. Har LLM deep learning hai, lekin har AI LLM nahi hai.</p></div>
<p><b>Artificial intelligence (AI)</b> broad goal hai: software jo woh kaam kare jismein normally insaani judgement lagta hai. Yeh haath se likhe rules se bhi ban sakta hai aur learning se bhi. <b>Machine learning (ML)</b> AI ka woh hissa hai jahan software ko har rule diya nahi jaata, balki woh data se patterns seekhta hai. <b>Deep learning</b> woh ML hai jo bade, bahut layers wale neural networks use karta hai. <b>Generative AI</b> woh deep learning hai jo naya content <i>banata</i> hai (text, code, images). Jo chat assistants aap jaante ho woh <b>large language models (LLMs)</b> par bane generative AI hain. Chapter 2 in terms ko achhi tarah kholta hai.</p>

<h3>NOC mein milne wale teen tarah ke AI</h3>
<table class="cmp"><tr><th>Kind</th><th>Kya karta hai</th><th>NOC example</th><th>Agar galat ho</th></tr>
<tr><td><b>Predictive</b></td><td>History se seekh kar forecast karta hai ya deviation pakadta hai</td><td>"Uplink Gi0/1 teen hafte mein 90% par pahunchega"; interface apne baseline se bahut upar</td><td>Thoda time waste hota hai</td></tr>
<tr><td><b>Generative</b></td><td>Prompt se text, config ya code banata hai</td><td>Ticket summarise karna, syslog message samjhana, ACL draft karna</td><td>Galat config site tod sakta hai agar koi paste kar de</td></tr>
<tr><td><b>Agentic</b></td><td>Kai steps plan karke tools se execute karta hai</td><td>Diagnose, fix propose, login karke apply</td><td>Woh khud hi site tod deta hai</td></tr>
</table>
<p>Aakhri column dhyan se padho. Har level upar jaane par <b>power aur risk dono saath</b> badhte hain. Yahi ek idea batata hai ki is module ka doosra half grounding, guardrails, approval gates aur verification ke baare mein kyun hai.</p>

<h3>Yeh abhi kyun matter karta hai</h3>
<p>Networks itna data banate hain jitna insaan padh nahi sakte: syslog, SNMP counters, streaming telemetry, NetFlow, configuration history aur tickets. Ek mid-size enterprise din mein laakhon log lines bana sakti hai. AI us baadh ko kuch incidents mein correlate karke, dheeme trends pakad kar, aur plain English sawaalon ko jawab mein badal kar madad karta hai. Vendors ab apne management aur assurance platforms ke andar AI assistants dete hain, aur exams expect karte hain ki aap samjho yeh tools kya karte hain aur kahan fail hote hain. Employers aise engineers chahte hain jo AI se tez kaam karein <i>bina</i> woh insaan bane jisne core router mein hallucinated config paste kar diya.</p>

<h3>Labs kaise kaam karti hain</h3>
<p>Labs <b>NK Copilot</b> use karti hain, ek training assistant jo NOC host par chalta hai. Yeh jaan-boojh kar simple aur rule-based hai taaki uska behaviour repeatable rahe, lekin yeh real AI assistant ki tarah act karta hai: telemetry collect karta hai, confidence scores ke saath findings list karta hai, numbered plan propose karta hai aur agent ki tarah chal sakta hai. Yeh zyada tar sahi hota hai aur kabhi-kabhi <b>confidently galat</b>, bilkul intern ki tarah. Labs mein aapka kaam hai ise use karna, show commands se iski galti pakadna, aur asli root cause fix karna.</p>
<pre class="code"><span class="c">! NOC host par typical pehle commands</span>
NOC&gt; copilot help
NOC&gt; copilot analyze all
NOC&gt; copilot plan
NOC&gt; copilot explain 2</pre>

<div class="warn"><p><b>Beginners ki common galti.</b> "AI" ko ek magic cheez samajhna. Forecasting model, chat assistant aur autonomous agent bilkul alag tools hain jinke risks alag hain. Hamesha poocho: yeh predict kar raha hai, generate kar raha hai ya act kar raha hai?</p></div>
<div class="exam"><p><b>Exam trap.</b> Generative AI deep learning ka subset hai, deep learning machine learning ka subset hai, aur machine learning AI ka subset hai. Questions kisi tool ko describe karke pooch sakte hain ki woh kis category ka hai: naya text ya config banana matlab generative; history se forecast matlab predictive; tools se action lena matlab agentic.</p></div>

<div class="scn"><h4>Raat 2 baje ka copy-paste</h4><p>Night shift par ek junior engineer ne public chat assistant se poocha ki branch router par "OSPF flapping" kaise roke, suggested commands seedhe router mein paste kar diye aur sirf ek side ke OSPF timers badal diye. Adjacency, jo ek kharab optic ki wajah se flap ho rahi thi, ab poori tarah down ho gayi aur branch subah tak disconnected rahi. Review mein teen problems nikli: assistant ne router ka data kabhi dekha hi nahi, engineer ne suggestion verify nahi kiya, aur raat mein bina review ke change ko kisi cheez ne roka nahi.</p><p><b>Seekh:</b> AI powerful assistant hai, authority nahi. Pehle evidence, phir human approval, aur change control hamesha.</p></div>

<div class="iv"><p class="q">"Aapko network operations mein AI kahan madad karta dikhta hai, aur kahan aap uspar trust nahi karoge?"</p><p>Strong answer: predictive, generative aur agentic uses ko alag karo. Baselines, anomalies aur capacity forecasts ke liye predictive; logs summarise karne aur configs ya documentation draft karne ke liye generative; agentic sirf guardrails ke andar (pehle read-only, approval gates, scope limits, audit logs). Phir saaf bolo ki aap kabhi bhi AI suggestion ko show output se check kiye bina apply nahi karoge, kyunki LLMs hallucinate kar sakte hain. Interviewers ko balanced answer pasand hai: speed ke liye enthusiastic, verification mein strict.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AI ke andar ML, uske andar deep learning, aur uske andar generative AI aur LLMs hain.</li>
<li>NOC mein AI predict karta hai (forecast, anomalies), generate karta hai (summaries, drafts) ya act karta hai (agents).</li>
<li>Predictive se generative se agentic tak power aur risk saath badhte hain.</li>
<li>AI assistant ko brilliant naye intern ki tarah treat karo: useful, tez, kabhi-kabhi confidently galat.</li>
<li>Engineer ki core skill ab verification hai: approval se pehle evidence.</li>
</ul></div>
`}};export{e as default};