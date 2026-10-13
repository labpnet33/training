var e={id:`overview`,h:{en:`Troubleshooting like a CCIE: what you will learn and the method`,hi:`CCIE jaisa troubleshooting: aap kya seekhoge aur method`},body:{en:`
<p>Think of a doctor in an emergency room. She does not guess the illness from the patient's face. She asks where it hurts, takes a pulse, orders a blood test, reads the result, treats one thing and checks again. A senior wireless engineer works the same way. A junior engineer reboots the controller and hopes. The difference between them is <b>evidence</b>. This module teaches you to collect evidence from a Catalyst 9800-style controller, read it correctly and prove a repair.</p>

<h3>What you will learn</h3>
<ul>
<li>A fixed method: symptom, scope, layer, evidence, one change, re-test (this chapter).</li>
<li>The layers of a Wi-Fi session and the one command that proves each layer (chapters 2 and 3).</li>
<li><b>Radioactive Trace</b>, the per-client trace of the 9800 (chapters 4, 5 and 7).</li>
<li><b>Embedded Packet Capture</b> (EPC), a packet sniffer inside the controller (chapters 6 and 7).</li>
<li>AP join debugging and join statistics (chapter 8), RF diagnostics (chapter 9) and AAA failure codes (chapter 10).</li>
<li>Wireshark on 802.11 and CAPWAP, <code>show tech</code> and evidence packs (chapter 11), then a three-layer capstone (chapter 12).</li>
</ul>
<p><b>Prerequisites.</b> You should know the 9800 object model (WLAN profile, policy profile, tags), the lab topology and basic triage from the module <b>wl-ops</b> (Wireless operations). We do not teach those again here; we refer back. If you cannot yet explain what a policy tag does, revisit wl-ops first.</p>

<div class="note"><p><b>Honest labelling.</b> The labs run on an original learning model, not Cisco software. The <b>command forms</b> of Radioactive Trace and EPC follow the real platform, but the <b>text of the trace lines</b>, the <b>packet list</b> and the join-statistics layout are written by the model. Real controllers print different wording. What transfers is the skill: find the stage, the level and the reason. Items marked <b>concept only</b> are taught but not simulated.</p></div>

<h3>The six-step method</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting method">
<rect x="10" y="40" width="90" height="50" rx="8" fill="#bae6fd"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text>
<rect x="115" y="40" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Scope</text>
<rect x="220" y="40" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="265" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Layer</text>
<rect x="325" y="40" width="90" height="50" rx="8" fill="#fde68a"/><text x="370" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Evidence</text>
<rect x="430" y="40" width="90" height="50" rx="8" fill="#fed7aa"/><text x="475" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 One change</text>
<rect x="535" y="40" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="582" y="70" text-anchor="middle" class="svg-ink" font-size="13">6 Re-test</text>
<line x1="100" y1="65" x2="115" y2="65" stroke="#64748b" stroke-width="2"/><line x1="205" y1="65" x2="220" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="325" y2="65" stroke="#64748b" stroke-width="2"/><line x1="415" y1="65" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="535" y2="65" stroke="#64748b" stroke-width="2"/>
<path d="M582 90 L582 125 L55 125 L55 90" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">still failing? the next layer is now visible: repeat</text>
</svg><p class="cap">The loop. Fixing one layer often reveals the next defect behind it.</p></div>

<dl class="terms">
<dt>1 Symptom</dt><dd>Write what the user sees in the user's words: "NK-STAFF connects and then drops after two seconds". Do not write a cause yet.</dd>
<dt>2 Scope</dt><dd>Who is affected: one client, one AP, one WLAN, one floor, everybody? Scope narrows the layer faster than any command.</dd>
<dt>3 Layer</dt><dd>Pick the layer that matches the scope (chapter 2).</dd>
<dt>4 Evidence</dt><dd>Run the tool that proves or kills your suspicion: a show command, a trace, a capture.</dd>
<dt>5 One change</dt><dd>Change exactly one object, on the device that owns it, ideally reversible.</dd>
<dt>6 Re-test</dt><dd>Repeat the exact failing action and read the evidence again.</dd>
</dl>

<div class="eg"><p><b>Worked example (scope).</b> Ticket: "Wi-Fi is broken". You ask three questions. One laptop or many? Only LAPTOP1 fails; PHONE1 and LAPTOP2 work on the same AP. Same SSID? LAPTOP1 uses NK-STAFF, PHONE1 uses NK-VOICE. Since the AP, the controller and the RADIUS server all serve other clients, the fault sits in objects that only NK-STAFF uses: its WLAN profile, its policy profile PP-STAFF, VLAN 20 or the DHCP pool of VLAN 20. You eliminated AP join, RF and AAA in 60 seconds without typing a command.</p></div>

<h3>Where you work: CLI and the web UI</h3>
<p>The 9800-style web UI has the menu <b>Troubleshooting &gt; Logs | Ping | Radioactive Trace</b> (and a Packet Capture page). Every action there runs the same commands as the console. The web UI covers WLC1 only; R1 and SW1 are CLI. Use the CLI to learn, the web UI to be fast.</p>

<h3>Evidence before change</h3>
<p>Every reload, every "delete and recreate the WLAN" destroys evidence and may hide the real cause. Keep a one-page <b>evidence pack</b>: the ticket text, the scope, the commands you ran with timestamps, the output that proved the cause, the change you made and the output that proved the fix. Chapter 11 builds one in a lab.</p>
<pre class="out">WLC1# <span class="hl">show clock</span>
*17:12:40.114 UTC Sun Oct 4 2026</pre>
<p>Always note the controller time. Traces, logs and RADIUS server logs are matched by timestamp, and a five-minute clock difference makes correlation hard.</p>

<div class="warn"><p><b>Common mistake.</b> Changing two things at once ("I re-keyed the WLAN and rebooted the AP"). If the problem disappears you do not know why, and you cannot write a safe runbook.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions describe a symptom and offer four fixes. Pick the option that is evidence-first and scoped (trace the client, check the join statistics) over the option that is big and destructive (reload, factory reset).</p></div>

<div class="scn"><h4>The 2 a.m. reload</h4><p>A hospital wing lost Wi-Fi at night. The on-call engineer reloaded the controller; Wi-Fi returned for ten minutes and failed again. The next morning a senior engineer found in the AP join history that the access trunk allowed only VLANs 20 and 40: the management VLAN had been pruned by a switch change. The reload had merely made the APs rejoin through a stale cache until the next echo failure.</p><p><b>Lesson:</b> a reload erases history and hides the cause. Read the join statistics first.</p></div>

<div class="iv"><p class="q">"A user says the Wi-Fi does not work. What do you do first?"</p><p>Ask scope questions (who, where, which SSID, since when), pick the layer they point to, and collect evidence with the least invasive tool: show commands, then a Radioactive Trace for one client. Make one reversible change and re-test. Mention that you document evidence for the next engineer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: symptom, scope, layer, evidence, one change, re-test.</li>
<li>Scope questions remove whole layers before you type a command.</li>
<li>The lab trace wording and packet list are a learning approximation; the reading skill is real.</li>
<li>The web UI path is Troubleshooting &gt; Radioactive Trace; it runs the same commands.</li>
<li>Never reload to diagnose; note the clock and keep an evidence pack.</li>
</ul></div>
`,hi:`
<p>Emergency room ke doctor ko socho. Woh patient ka chehra dekh kar bimari ka andaza nahi lagati. Woh poochti hai kahan dard hai, pulse leti hai, blood test order karti hai, result padhti hai, ek cheez treat karti hai aur phir dubara check karti hai. Senior wireless engineer bhi aise hi kaam karta hai. Junior engineer controller reboot karke umeed rakhta hai. Dono mein fark <b>evidence</b> ka hai. Yeh module aapko sikhata hai ki Catalyst 9800-style controller se evidence kaise collect karein, sahi padhein aur repair prove karein.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Fixed method: symptom, scope, layer, evidence, one change, re-test (yeh chapter).</li>
<li>Wi-Fi session ki layers aur har layer ko prove karne wala ek command (chapter 2 aur 3).</li>
<li><b>Radioactive Trace</b>, 9800 ka per-client trace (chapter 4, 5 aur 7).</li>
<li><b>Embedded Packet Capture</b> (EPC), controller ke andar ka packet sniffer (chapter 6 aur 7).</li>
<li>AP join debugging aur join statistics (chapter 8), RF diagnostics (chapter 9) aur AAA failure codes (chapter 10).</li>
<li>802.11 aur CAPWAP par Wireshark, <code>show tech</code> aur evidence packs (chapter 11), phir teen-layer capstone (chapter 12).</li>
</ul>
<p><b>Prerequisites.</b> Aapko module <b>wl-ops</b> (Wireless operations) se 9800 object model (WLAN profile, policy profile, tags), lab topology aur basic triage aani chahiye. Hum unhe yahan dubara nahi padhate; wapas refer karte hain. Agar aap abhi tak nahi bata sakte ki policy tag kya karta hai, to pehle wl-ops dekho.</p>

<div class="note"><p><b>Honest labelling.</b> Labs ek original learning model par chalte hain, Cisco software nahi. Radioactive Trace aur EPC ke <b>command forms</b> real platform jaise hain, lekin <b>trace lines ka text</b>, <b>packet list</b> aur join-statistics ka layout model ne likha hai. Real controller alag wording print karte hain. Jo skill transfer hoti hai woh yeh hai: stage, level aur reason dhundhna. <b>Concept only</b> wale items sikhaye jaate hain lekin simulate nahi hote.</p></div>

<h3>Chhe-step method</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting method">
<rect x="10" y="40" width="90" height="50" rx="8" fill="#bae6fd"/><text x="55" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text>
<rect x="115" y="40" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="160" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Scope</text>
<rect x="220" y="40" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="265" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 Layer</text>
<rect x="325" y="40" width="90" height="50" rx="8" fill="#fde68a"/><text x="370" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Evidence</text>
<rect x="430" y="40" width="90" height="50" rx="8" fill="#fed7aa"/><text x="475" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Ek change</text>
<rect x="535" y="40" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="582" y="70" text-anchor="middle" class="svg-ink" font-size="13">6 Re-test</text>
<line x1="100" y1="65" x2="115" y2="65" stroke="#64748b" stroke-width="2"/><line x1="205" y1="65" x2="220" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="325" y2="65" stroke="#64748b" stroke-width="2"/><line x1="415" y1="65" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><line x1="520" y1="65" x2="535" y2="65" stroke="#64748b" stroke-width="2"/>
<path d="M582 90 L582 125 L55 125 L55 90" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">abhi bhi fail? agli layer ab dikhti hai: dohrao</text>
</svg><p class="cap">Loop. Ek layer fix karne par aksar uske peeche ka agla defect dikhta hai.</p></div>

<dl class="terms">
<dt>1 Symptom</dt><dd>User jo dekhta hai woh user ke words mein likho: "NK-STAFF connect hota hai aur do second baad drop ho jata hai". Abhi cause mat likho.</dd>
<dt>2 Scope</dt><dd>Kaun affected hai: ek client, ek AP, ek WLAN, ek floor, ya sab? Scope kisi bhi command se jaldi layer chhoti kar deta hai.</dd>
<dt>3 Layer</dt><dd>Scope se match karti layer chuno (chapter 2).</dd>
<dt>4 Evidence</dt><dd>Woh tool chalao jo aapka shak prove ya kill kare: show command, trace, capture.</dd>
<dt>5 One change</dt><dd>Sirf ek object badlo, us device par jo use own karta hai, aur ho sake to reversible.</dd>
<dt>6 Re-test</dt><dd>Wahi failing action dubara karo aur evidence phir se padho.</dd>
</dl>

<div class="eg"><p><b>Worked example (scope).</b> Ticket: "Wi-Fi toot gaya hai". Aap teen sawaal poochte ho. Ek laptop ya kai? Sirf LAPTOP1 fail hota hai; PHONE1 aur LAPTOP2 usi AP par chalte hain. Same SSID? LAPTOP1 NK-STAFF use karta hai, PHONE1 NK-VOICE. Kyunki AP, controller aur RADIUS server dusre clients ko serve karte hain, fault un objects mein hai jo sirf NK-STAFF use karta hai: uska WLAN profile, policy profile PP-STAFF, VLAN 20 ya VLAN 20 ka DHCP pool. Aapne ek bhi command type kiye bina 60 second mein AP join, RF aur AAA hata diye.</p></div>

<h3>Aap kahan kaam karte ho: CLI aur web UI</h3>
<p>9800-style web UI mein menu hai <b>Troubleshooting &gt; Logs | Ping | Radioactive Trace</b> (aur ek Packet Capture page). Wahan har action wahi commands chalata hai jo console chalata hai. Web UI sirf WLC1 cover karta hai; R1 aur SW1 CLI hain. Seekhne ke liye CLI, tez kaam ke liye web UI.</p>

<h3>Change se pehle evidence</h3>
<p>Har reload, har "WLAN delete karke recreate" evidence mita deta hai aur asli cause chhupa sakta hai. Ek page ka <b>evidence pack</b> rakho: ticket text, scope, timestamps ke saath chalaye commands, jis output ne cause prove kiya, jo change kiya aur jis output ne fix prove kiya. Chapter 11 lab mein ek evidence pack banata hai.</p>
<pre class="out">WLC1# <span class="hl">show clock</span>
*17:12:40.114 UTC Sun Oct 4 2026</pre>
<p>Controller ka time hamesha note karo. Traces, logs aur RADIUS server logs timestamp se match hote hain, aur paanch minute ka clock difference correlation mushkil bana deta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Do cheezein ek saath badalna ("maine WLAN re-key kiya aur AP reboot kiya"). Agar problem chali jaye to aapko pata nahi kyun, aur aap safe runbook nahi likh sakte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal symptom batate hain aur chaar fixes dete hain. Woh option chuno jo evidence-first aur scoped ho (client trace karo, join statistics check karo), us option ko nahi jo bada aur destructive ho (reload, factory reset).</p></div>

<div class="scn"><h4>Raat 2 baje ka reload</h4><p>Hospital wing ka Wi-Fi raat ko gaya. On-call engineer ne controller reload kiya; Wi-Fi das minute aaya aur phir fail ho gaya. Agli subah senior engineer ne AP join history mein dekha ki access trunk sirf VLAN 20 aur 40 allow karta tha: switch change se management VLAN prune ho gaya tha. Reload ne bas APs ko stale cache se rejoin karaya tha jab tak agla echo fail nahi hua.</p><p><b>Lesson:</b> reload history mita deta hai aur cause chhupata hai. Pehle join statistics padho.</p></div>

<div class="iv"><p class="q">"User kehta hai Wi-Fi kaam nahi karta. Aap sabse pehle kya karte ho?"</p><p>Scope ke sawaal poochta hoon (kaun, kahan, kaunsa SSID, kab se), jo layer woh point karte hain use chunta hoon, aur sabse kam invasive tool se evidence leta hoon: show commands, phir ek client ka Radioactive Trace. Ek reversible change karta hoon aur re-test. Mention karo ki agle engineer ke liye evidence document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: symptom, scope, layer, evidence, one change, re-test.</li>
<li>Scope ke sawaal command type karne se pehle poori layers hata dete hain.</li>
<li>Lab ka trace wording aur packet list learning approximation hain; padhne ki skill real hai.</li>
<li>Web UI path Troubleshooting &gt; Radioactive Trace hai; woh wahi commands chalata hai.</li>
<li>Diagnose ke liye kabhi reload nahi; clock note karo aur evidence pack rakho.</li>
</ul></div>
`}};export{e as default};