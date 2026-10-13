var e={id:`lab-practice`,h:{en:`How to practise in the labs and plan your study`,hi:`Labs mein practice kaise karein aur study plan kaise banayein`},body:{en:`
<p>Reading explains, but only typing builds speed. JNCIP-level skill is the ability to predict what a command will do, then check it. The labs in this course give you a safe network where you can break things and repair them as often as you like. This chapter shows how to get the most from them.</p>

<h3>What a lab gives you</h3>
<ul>
<li>A small topology of Junos routers (R1, R2, R3 and so on), plus hosts such as PC1 and SRV, already cabled and partly configured.</li>
<li>A brief that reads like a ticket from a real company, with numbered tasks. Each task is checked by the lab, so you know when you are done.</li>
<li>Two kinds of labs: <b>config</b> labs, where you build a feature, and <b>troubleshoot</b> labs, where something is already broken and you must find it.</li>
<li>Hints and a model solution, which you should use last, not first.</li>
</ul>
<div class="note"><p>The lab engine is an educational simulator that accepts Junos-style commands. It reproduces the commands in this course faithfully, but it is not Juniper software. Some rarely used options may be accepted in configuration without a visible effect. When a chapter says a feature is shown as configuration only, check the behaviour on real equipment or in the vendor documentation before relying on it in production.</p></div>

<h3>The four-pass study loop</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Four pass study loop">
<rect x="15" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 1: Read</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">chapter + diagram</text>
<rect x="175" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 2: Follow</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">lab with hints</text>
<rect x="335" y="40" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="405" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 3: Alone</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="11">reset, no hints</text>
<rect x="495" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 4: Break</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">fault, find, fix</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Explain each result aloud before you run the next command.</text>
</svg><p class="cap">Read, follow, repeat alone, then break it yourself.</p></div>
<ol>
<li><b>Read</b> the chapter first, including the output blocks. Predict what each command shows.</li>
<li><b>Follow</b> the lab with hints. Aim to understand every command, not to finish fast.</li>
<li><b>Repeat alone</b> after a reset, without hints, and time yourself. Exam tasks are timed.</li>
<li><b>Break it</b>: introduce one fault of your own (a wrong router ID, a missing family iso, a wrong area) and find it using the method from chapter 6. This is the best troubleshooting practice there is.</li>
</ol>

<h3>A weekly plan</h3>
<table class="cmp"><tr><th>Week</th><th>Focus</th><th>Lab goal</th></tr>
<tr><td>1</td><td>Layer 2: switching, STP, 802.1X, voice</td><td>Trunks, root bridge, port authentication</td></tr>
<tr><td>2</td><td>OSPF advanced</td><td>OSPFv3, policy tags, overload, virtual link</td></tr>
<tr><td>3</td><td>IS-IS advanced</td><td>Leaking, overload, redistribution</td></tr>
<tr><td>4</td><td>BGP and policy</td><td>IBGP and EBGP, attributes, hidden routes</td></tr>
<tr><td>5</td><td>Multicast and CoS</td><td>PIM, RP, schedulers, classifiers</td></tr>
<tr><td>6</td><td>EVPN-VXLAN and full revision</td><td>Timed mixed tickets, weak topics</td></tr></table>
<p>Adjust the plan to your experience. If you already work with BGP daily, shorten week 4 and spend the time on the topics you do not see at work.</p>

<h3>Keep a command notebook</h3>
<p>For each lab write three lines: the symptom or goal, the command that revealed the answer, and the one-sentence reason. After a month this notebook is your personal exam sheet. A sample entry:</p>
<pre class="code"><span class="c">! Lab: virtual link down</span>
<span class="c">! Symptom : R1 has no route to 172.16.5.0/24</span>
<span class="c">! Revealed: show ospf interface -> vl-10.255.5.3 Down</span>
<span class="c">! Reason  : neighbor-id must be the remote router ID, not an interface IP</span></pre>

<h3>Use the CLI helpers</h3>
<p>The question mark lists the valid next keyword at any point and saves a lot of memorising. Pipe to <code>| match</code> to search long output, <code>| display set</code> to see configuration as one-line set commands that you can copy, and <code>| compare</code> before every commit. On the exam these three habits save minutes per task.</p>

<div class="eg"><p><b>Worked example.</b> You have 20 minutes for an IS-IS leaking task. Minute 0 to 2: read the topology and the task. Minute 2 to 4: <code>show isis adjacency</code> and <code>show route</code> on the router with the symptom. Minute 4 to 12: build the policy and apply it on both borders. Minute 12 to 16: verify with the same commands plus a ping. Minute 16 to 20: spare time to review, not to start something new.</p></div>

<div class="warn"><p><b>Common mistake.</b> Copying the model solution and calling the lab done. A passed task check does not prove you understood. After each task close the notes and explain, aloud, why it works.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time pressure makes people skip verification. Always run one show command that proves the requirement, not only <code>commit complete</code>, which only means the syntax was accepted.</p></div>

<div class="scn"><h4>From 40 minutes to 15</h4><p>A learner needed 40 minutes for the OSPF overload lab on the first pass. After writing a short checklist (baseline show route, set overload, verify one next hop, check the loopback still answers) and repeating the lab four times, the same task took 15 minutes with fewer errors, and the learner could explain each step.</p><p><b>Lesson:</b> repetition with a checklist beats a single careful run.</p></div>

<div class="iv"><p class="q">"How did you prepare for a hands-on professional exam?"</p><p>Build things in a lab, repeat them without hints against a clock, deliberately break them and fix them with a method, and keep a notebook of symptoms and revealing commands. Mention that you verify every requirement with a show command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the loop: read, follow with hints, repeat alone, then break it yourself.</li>
<li>Config labs build features; troubleshoot labs train the method from chapter 6.</li>
<li>Time yourself; exam tasks are timed.</li>
<li>Keep a notebook of symptom, revealing command and reason.</li>
<li>Verify each requirement with a show command, not just a successful commit.</li>
</ul></div>
`,hi:`
<p>Padhna samjhata hai, par speed sirf type karne se banti hai. JNCIP-level skill hai yeh predict kar paana ki command kya karega, phir use check karna. Is course ke labs aapko safe network dete hain jahan aap jitni baar chaho cheezein todo aur theek karo. Yeh chapter dikhata hai ki unka poora faida kaise uthayein.</p>

<h3>Lab aapko kya deta hai</h3>
<ul>
<li>Junos routers (R1, R2, R3 waghera) aur PC1, SRV jaise hosts ki chhoti topology, jo pehle se cable aur aanshik configured hoti hai.</li>
<li>Asli company ke ticket jaisa brief, numbered tasks ke saath. Har task lab check karta hai, isliye pata chalta hai kab poora hua.</li>
<li>Do tarah ke labs: <b>config</b> labs, jahan aap feature banate ho, aur <b>troubleshoot</b> labs, jahan kuch pehle se kharab hai aur aapko dhoondhna hai.</li>
<li>Hints aur model solution, jinhe aakhir mein use karna chahiye, pehle nahi.</li>
</ul>
<div class="note"><p>Lab engine ek educational simulator hai jo Junos-style commands accept karta hai. Yeh is course ke commands ko imaandari se reproduce karta hai, par Juniper software nahi hai. Kuch kam use hone wale options configuration mein accept ho sakte hain bina dikhne wale asar ke. Jab chapter kahe ki koi feature sirf configuration ke roop mein dikhaya gaya hai, to production mein bharosa karne se pehle real equipment ya vendor documentation par behaviour check karo.</p></div>

<h3>Chaar-pass study loop</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chaar pass study loop">
<rect x="15" y="40" width="140" height="70" rx="10" fill="#bae6fd"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 1: Read</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">chapter + diagram</text>
<rect x="175" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="245" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 2: Follow</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">hints ke saath lab</text>
<rect x="335" y="40" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="405" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 3: Alone</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="11">reset, bina hints</text>
<rect x="495" y="40" width="130" height="70" rx="10" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Pass 4: Break</text><text x="560" y="88" text-anchor="middle" class="svg-muted" font-size="11">fault, dhoondho, fix</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Agla command chalane se pehle har result zor se samjhao.</text>
</svg><p class="cap">Padho, follow karo, akele dohrao, phir khud todo.</p></div>
<ol>
<li>Pehle chapter <b>padho</b>, output blocks samet. Predict karo har command kya dikhayega.</li>
<li>Hints ke saath lab <b>follow</b> karo. Har command samajhna maqsad hai, jaldi khatam karna nahi.</li>
<li>Reset ke baad bina hints ke <b>akele dohrao</b> aur samay naapo. Exam tasks timed hote hain.</li>
<li><b>Todo</b>: apna ek fault daalo (galat router ID, missing family iso, galat area) aur chapter 6 ke method se dhoondho. Troubleshooting ki sabse achhi practice yahi hai.</li>
</ol>

<h3>Saptahik plan</h3>
<table class="cmp"><tr><th>Week</th><th>Focus</th><th>Lab goal</th></tr>
<tr><td>1</td><td>Layer 2: switching, STP, 802.1X, voice</td><td>Trunks, root bridge, port authentication</td></tr>
<tr><td>2</td><td>OSPF advanced</td><td>OSPFv3, policy tags, overload, virtual link</td></tr>
<tr><td>3</td><td>IS-IS advanced</td><td>Leaking, overload, redistribution</td></tr>
<tr><td>4</td><td>BGP aur policy</td><td>IBGP aur EBGP, attributes, hidden routes</td></tr>
<tr><td>5</td><td>Multicast aur CoS</td><td>PIM, RP, schedulers, classifiers</td></tr>
<tr><td>6</td><td>EVPN-VXLAN aur poori revision</td><td>Timed mixed tickets, kamzor topics</td></tr></table>
<p>Plan ko apne experience ke hisaab se badlo. Aap roz BGP par kaam karte ho to week 4 chhota karo aur woh samay un topics par lagao jo kaam par nahi dikhte.</p>

<h3>Command notebook rakho</h3>
<p>Har lab ke liye teen lines likho: symptom ya goal, jis command ne jawab dikhaya, aur ek-vakya ka reason. Ek mahine baad yeh notebook aapki apni exam sheet hai. Sample entry:</p>
<pre class="code"><span class="c">! Lab: virtual link down</span>
<span class="c">! Symptom : R1 ke paas 172.16.5.0/24 ka route nahi</span>
<span class="c">! Revealed: show ospf interface -> vl-10.255.5.3 Down</span>
<span class="c">! Reason  : neighbor-id remote router ID hona chahiye, interface IP nahi</span></pre>

<h3>CLI helpers use karo</h3>
<p>Question mark kisi bhi point par valid agla keyword list karta hai aur ratne se bachata hai. Lambe output mein dhoondhne ke liye <code>| match</code>, configuration ko copy karne layak one-line set commands mein dekhne ke liye <code>| display set</code>, aur har commit se pehle <code>| compare</code> use karo. Exam mein yeh teen aadatein har task par minutes bachati hain.</p>

<div class="eg"><p><b>Worked example.</b> IS-IS leaking task ke liye aapke paas 20 minute hain. Minute 0 se 2: topology aur task padho. Minute 2 se 4: symptom wale router par <code>show isis adjacency</code> aur <code>show route</code>. Minute 4 se 12: policy banao aur dono borders par lagao. Minute 12 se 16: wahi commands plus ping se verify karo. Minute 16 se 20: review ke liye bacha samay, naya kaam shuru karne ke liye nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Model solution copy karke lab ko complete kehna. Task check pass hone se saabit nahi hota ki aap samjhe. Har task ke baad notes band karke zor se batao ki yeh kyun chalta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Time pressure mein log verification chhod dete hain. Hamesha ek show command chalao jo requirement saabit kare, sirf <code>commit complete</code> nahi, jiska matlab bas yeh hai ki syntax accept hua.</p></div>

<div class="scn"><h4>40 minute se 15 minute</h4><p>Ek learner ko pehle pass mein OSPF overload lab mein 40 minute lage. Chhoti checklist likhne (baseline show route, set overload, ek next hop verify karo, check karo loopback abhi bhi jawab deta hai) aur lab ko chaar baar dohrane ke baad wahi task 15 minute mein kam galtiyon ke saath hua, aur learner har step samjha sakta tha.</p><p><b>Lesson:</b> checklist ke saath repetition ek careful run se behtar hai.</p></div>

<div class="iv"><p class="q">"Hands-on professional exam ki taiyari kaise ki?"</p><p>Lab mein cheezein banayi, bina hints ke clock ke saath dohrayi, jaanbujhkar todi aur method se theek ki, aur symptoms tatha revealing commands ka notebook rakha. Batao ki har requirement ko show command se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop use karo: padho, hints ke saath follow karo, akele dohrao, phir khud todo.</li>
<li>Config labs features banate hain; troubleshoot labs chapter 6 ka method train karte hain.</li>
<li>Samay naapo; exam tasks timed hote hain.</li>
<li>Symptom, revealing command aur reason ka notebook rakho.</li>
<li>Har requirement ko show command se verify karo, sirf successful commit se nahi.</li>
</ul></div>
`}};export{e as default};