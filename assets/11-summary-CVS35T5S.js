var e={id:`summary`,h:{en:`Summary, can-do checklist, portfolio advice and what comes next`,hi:`Summary, can-do checklist, portfolio salah aur aage kya`},body:{en:`
<p>You started this module with eighteen separate tools and you end it with one toolkit that you can explain, run, test and hand over. This chapter pulls the module together: the chain in one table, a checklist you can use to judge yourself, advice for turning the work into a portfolio piece, and an honest list of where the lab differs from a real network.</p>

<h3>The chain in one table</h3>
<table class="cmp">
<tr><th>Stage</th><th>Command</th><th>Question it answers</th><th>Proof</th></tr>
<tr><td>Scope</td><td>inventory</td><td>Which devices are in?</td><td>The count: 2 hosts in scope</td></tr>
<tr><td>Data</td><td>intent</td><td>What does NetBox want?</td><td>0 schema errors, JSON per device</td></tr>
<tr><td>Text</td><td>render</td><td>What is the exact text per vendor?</td><td>Files in build/configs</td></tr>
<tr><td>Gate</td><td>gate</td><td>May we go?</td><td>GATE PASSED, exit code 0</td></tr>
<tr><td>Look</td><td>plan</td><td>What would change?</td><td>Diff per device, nothing changed</td></tr>
<tr><td>Change</td><td>apply</td><td>Make it so, safely</td><td>committed and verified, or rolled back with a reason</td></tr>
<tr><td>Watch</td><td>verify</td><td>Does it still match?</td><td>matches NetBox, exit code 0</td></tr>
</table>

<h3>The can-do checklist</h3>
<p>Be honest. A line you cannot tick is a good place to practise next.</p>
<ul>
<li>I can draw the data flow from source of truth to device and name the tool of each stage.</li>
<li>I can justify each library in a design in one sentence, and remove the ones I cannot justify.</li>
<li>I can lay out a package so that generated folders are never edited and the front end has no logic.</li>
<li>I can keep secrets in the environment, fail loudly when one is missing, and prove that the log is clean.</li>
<li>I can build a Nornir inventory from NetBox and add what NetBox must not hold.</li>
<li>I can turn NetBox data into an intent document, check it with a schema and a format checker, and render one template per vendor.</li>
<li>I can build a gate with ordered stages, and prove that each stage can say no.</li>
<li>I can write a change task with a dry run, a commit, a read-back and a rollback, and use a confirmed commit on Junos.</li>
<li>I can write verify as a read-only run with an exit code, and schedule it.</li>
<li>I can unit-test decision logic with a fake device.</li>
<li>I can take over a toolkit, place a problem in the chain, and fix its cause with evidence.</li>
<li>I can describe four follow-on builds as design briefs and say which part I built and ran myself.</li>
</ul>

<h3>Portfolio advice</h3>
<p>A hiring manager reads a repository for five minutes. Make those minutes count.</p>
<ol>
<li><b>README first.</b> What it does in two sentences, the diagram of the chain, the commands for each stage, and what a normal run prints, with the counts.</li>
<li><b>Show real output.</b> Paste a plan, an apply and a verify with an exit code. Show the rollback demo: a tool that proves its safety net impresses more than one that claims it.</li>
<li><b>Include the tests and the gate.</b> A failing example in the docs (the gate blocking a typo) shows judgement.</li>
<li><b>Never commit secrets.</b> Ship a <code>.env.example</code> with names and fake values, and a <code>.gitignore</code>. Check the history before you publish.</li>
<li><b>Be honest about scope.</b> Label builds you did not run as design briefs. Add a "Known limits" section, for example "merge does not remove lines".</li>
<li><b>Practise the five-minute demo.</b> Inventory, plan, a gate that blocks, an apply, a drift and its repair.</li>
</ol>

<h3>Where the lab differs from a real network</h3>
<ul>
<li>The NetBox certificate is self-signed, so the code sets <code>verify = False</code>. Use your CA bundle in real life.</li>
<li>Batfish in the lab is a simplified model. It flags typos inside known IOS stanzas; test your own Batfish with a deliberately broken file.</li>
<li>Junos rounds a confirmed commit up to whole minutes in the lab. IOS has no commit confirm, in the lab and in NAPALM.</li>
<li>In the lab, an IOS rollback restores global commands but may leave an interface line that was added. Real IOS replaces the whole configuration.</li>
<li>Real IOS XE needs file transfer (SCP) enabled for NAPALM to load configuration. The lab router needs nothing extra.</li>
</ul>

<div class="exam"><p><b>Exam angle.</b> Questions on this module ask for the <i>reason</i> behind a design, not a command. Practise saying why: why an intent layer, why compare first, why the confirm, why verify uses the same function as the rollback, why apply is never scheduled.</p></div>

<div class="scn"><h4>The portfolio that got the call</h4><p>Two candidates sent similar branch tools. One README listed twenty technologies. The other had a diagram, three real outputs (a plan, a deliberate rollback and a drift repaired), a "Known limits" list and a note that the firewall pipeline was a design brief. The interviewers spent most of the hour on the second one, because every question had an answer that was already written down.</p><p><b>Lesson:</b> evidence and honest limits beat a long technology list.</p></div>

<div class="iv"><p class="q">"Tell me about the biggest thing you built with Python for network automation."</p><p>I built a multivendor branch toolkit. NetBox is the source of truth, Nornir takes its inventory from it, an intent document per device is checked against a schema, templates render one candidate per vendor, a gate blocks bad candidates, NAPALM does a dry run and a safe commit with read-back and rollback, and a read-only verify runs every night. I can show a rollback I triggered on purpose, and I know its limits: merge does not remove lines, and a firewall pipeline across vendors needs a partial-failure plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One chain: scope, data, text, gate, look, change, watch; each with a command and a proof.</li>
<li>Counts, exit codes and deliberate failures are the evidence you show.</li>
<li>Portfolio: README, real outputs, tests, no secrets, honest limits.</li>
<li>Know where the lab differs from real equipment and say so.</li>
<li>Next: pipelines (auto-cicd), containers (auto-containers) and telemetry (auto-telemetry) make the toolkit run itself.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module atharah alag tools ke saath shuru kiya tha aur ab ek toolkit ke saath khatam karte ho jise aap explain, run, test aur hand over kar sakte ho. Yeh chapter module ko jodta hai: chain ek table mein, ek checklist jisse aap khud ko parakh sako, portfolio piece banane ki salah, aur lab asli network se kahan alag hai uski imaandar list.</p>

<h3>Chain ek table mein</h3>
<table class="cmp">
<tr><th>Stage</th><th>Command</th><th>Kaunsa sawal</th><th>Saboot</th></tr>
<tr><td>Scope</td><td>inventory</td><td>Kaunse devices andar hain?</td><td>Ginti: 2 hosts in scope</td></tr>
<tr><td>Data</td><td>intent</td><td>NetBox kya chahta hai?</td><td>0 schema errors, har device ka JSON</td></tr>
<tr><td>Text</td><td>render</td><td>Har vendor ka exact text kya hai?</td><td>build/configs mein files</td></tr>
<tr><td>Gate</td><td>gate</td><td>Jaayein?</td><td>GATE PASSED, exit code 0</td></tr>
<tr><td>Dekho</td><td>plan</td><td>Kya badlega?</td><td>Har device ka diff, kuch badla nahi</td></tr>
<tr><td>Change</td><td>apply</td><td>Safely kar do</td><td>committed and verified, ya wajah ke saath rolled back</td></tr>
<tr><td>Nigrani</td><td>verify</td><td>Kya abhi bhi match hai?</td><td>matches NetBox, exit code 0</td></tr>
</table>

<h3>Can-do checklist</h3>
<p>Imaandari se dekho. Jo line tick na ho woh agla practice ka achha mauka hai.</p>
<ul>
<li>Main source of truth se device tak data flow draw kar sakta hoon aur har stage ke tool ka naam bata sakta hoon.</li>
<li>Main design ki har library ek vaakya mein justify kar sakta hoon, aur jo justify na ho use hata sakta hoon.</li>
<li>Main package aise layout kar sakta hoon ki generated folders kabhi edit na hon aur front end mein logic na ho.</li>
<li>Main secrets environment mein rakh sakta hoon, missing hone par zor se fail kara sakta hoon, aur saabit kar sakta hoon ki log saaf hai.</li>
<li>Main NetBox se Nornir inventory bana sakta hoon aur woh jod sakta hoon jo NetBox mein nahi hona chahiye.</li>
<li>Main NetBox data ko intent document mein badal sakta hoon, schema aur format checker se check kar sakta hoon, aur har vendor ka ek template render kar sakta hoon.</li>
<li>Main kram wale stages ka gate bana sakta hoon, aur saabit kar sakta hoon ki har stage na bol sakta hai.</li>
<li>Main dry run, commit, read-back aur rollback wala change task likh sakta hoon, aur Junos par confirmed commit use kar sakta hoon.</li>
<li>Main verify ko exit code wali read-only run ki tarah likh sakta hoon, aur schedule kar sakta hoon.</li>
<li>Main decision logic ko fake device se unit-test kar sakta hoon.</li>
<li>Main toolkit sambhal sakta hoon, problem ko chain mein rakh sakta hoon, aur evidence ke saath uski wajah theek kar sakta hoon.</li>
<li>Main chaar follow-on builds ko design briefs ki tarah describe kar sakta hoon aur bata sakta hoon ki kaunsa hissa maine khud banaya aur chalaya.</li>
</ul>

<h3>Portfolio ki salah</h3>
<p>Hiring manager repository paanch minute padhta hai. Un minuton ko kaam ka banao.</p>
<ol>
<li><b>Pehle README.</b> Do vaakya mein kya karta hai, chain ka diagram, har stage ke commands, aur normal run kya print karti hai, ginti ke saath.</li>
<li><b>Asli output dikhao.</b> Plan, apply aur verify exit code ke saath paste karo. Rollback demo dikhao: jo tool apna safety net saabit karta hai woh dawa karne wale se zyada prabhavit karta hai.</li>
<li><b>Tests aur gate shamil karo.</b> Docs mein ek failing example (gate typo ko rokta hua) samajh dikhata hai.</li>
<li><b>Secrets kabhi commit mat karo.</b> Naam aur nakli values ke saath <code>.env.example</code> aur ek <code>.gitignore</code> do. Publish se pehle history check karo.</li>
<li><b>Scope ke baare mein imaandar raho.</b> Jo builds nahi chalaye unhe design briefs likho. "Known limits" section jodo, jaise "merge lines nahi hatata".</li>
<li><b>Paanch minute ka demo practice karo.</b> Inventory, plan, rokne wala gate, apply, ek drift aur uski repair.</li>
</ol>

<h3>Lab asli network se kahan alag hai</h3>
<ul>
<li>NetBox certificate self-signed hai, isliye code <code>verify = False</code> likhta hai. Asli duniya mein apna CA bundle use karo.</li>
<li>Lab ka Batfish simplified model hai. Woh jaane hue IOS stanzas ke andar ke typos pakadta hai; apne Batfish ko jaan boojhkar toote file se test karo.</li>
<li>Lab mein Junos confirmed commit ko poore minute tak round up karta hai. IOS mein commit confirm nahi hai, lab mein bhi aur NAPALM mein bhi.</li>
<li>Lab mein IOS rollback global commands wapas karta hai par jodi gayi interface line chhod sakta hai. Asli IOS poori configuration replace karta hai.</li>
<li>Asli IOS XE par NAPALM ko configuration load karne ke liye file transfer (SCP) enable chahiye. Lab router ko kuch extra nahi chahiye.</li>
</ul>

<div class="exam"><p><b>Exam angle.</b> Is module ke sawal command nahi, design ke <i>karan</i> maangte hain. Kyon bolna practice karo: intent layer kyon, pehle compare kyon, confirm kyon, verify rollback wala hi function kyon use karta hai, apply kabhi schedule kyon nahi hota.</p></div>

<div class="scn"><h4>Jis portfolio ko call aaya</h4><p>Do candidates ne milte julte branch tools bheje. Ek ke README mein bees technologies ki list thi. Doosre ke paas diagram tha, teen asli outputs (plan, jaan boojhkar rollback aur theek hua drift), "Known limits" list aur note ki firewall pipeline design brief hai. Interviewers ne ghante ka zyada hissa doosre par lagaya, kyunki har sawal ka jawab pehle se likha tha.</p><p><b>Lesson:</b> evidence aur imaandar limits lambi technology list se behtar hain.</p></div>

<div class="iv"><p class="q">"Network automation ke liye Python mein jo sabse bada kaam banaya woh batao."</p><p>Maine multivendor branch toolkit banayi. NetBox source of truth hai, Nornir uska inventory leta hai, har device ka intent document schema se check hota hai, templates har vendor ka ek candidate render karte hain, gate bure candidates rokta hai, NAPALM dry run aur read-back aur rollback ke saath safe commit karta hai, aur read-only verify har raat chalta hai. Main jaan boojhkar trigger kiya rollback dikha sakta hoon, aur uski limits jaanta hoon: merge lines nahi hatata, aur do vendors ke firewall pipeline ko partial-failure plan chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek chain: scope, data, text, gate, dekho, change, nigrani; har ek ka command aur saboot.</li>
<li>Ginti, exit codes aur jaan boojhkar failures woh evidence hain jo aap dikhate ho.</li>
<li>Portfolio: README, asli outputs, tests, secrets nahi, imaandar limits.</li>
<li>Jaano lab asli equipment se kahan alag hai aur kaho.</li>
<li>Aage: pipelines (auto-cicd), containers (auto-containers) aur telemetry (auto-telemetry) toolkit ko khud chalne layak banate hain.</li>
</ul></div>
`}};export{e as default};