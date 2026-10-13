var e={id:`lab-fa-fabric-ts`,h:{en:`Lab fa-fabric-ts: HQ-FGT joins the logging fabric, two faults in a row`,hi:`Lab fa-fabric-ts: HQ-FGT logging fabric mein judta hai, do faults ek ke baad ek`},body:{en:`
<p>A new employee gets a laptop, but cannot log in. IT fixes the wrong password. Now the login works, but the mailbox is missing. Two faults, one after the other, and the second was invisible until the first was gone. This troubleshooting lab (type: troubleshoot, about 35 minutes) is exactly that, for a firewall. The head-office FortiGate HQ-FGT must log to FAZ-1 like the Madurai store does. The change ticket was applied last night and nothing arrives.</p>

<h3>The goal</h3>
<p>Fix the connection, fix the serial number problem, register HQ-FGT in the ADOM root, prove that traffic logs are stored, and answer one Security Fabric question. MDU-FGT already works: it is your reference. The key skill is to change one thing, test again and read the new message.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab fa-fabric-ts plan">
<rect x="10" y="26" width="140" height="64" rx="8" fill="#fed7aa"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Fault 1</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">timeout</text>
<rect x="170" y="26" width="140" height="64" rx="8" fill="#fed7aa"/><text x="240" y="52" text-anchor="middle" class="svg-ink" font-size="13">Fault 2</text><text x="240" y="70" text-anchor="middle" class="svg-muted" font-size="12">serial mismatch</text>
<rect x="330" y="26" width="140" height="64" rx="8" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">Register</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="12">ADOM root</text>
<rect x="490" y="26" width="140" height="64" rx="8" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="12">log in Log View</text>
<line x1="150" y1="58" x2="170" y2="58" stroke="#64748b" stroke-width="2"/><line x1="310" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="10" y="125" class="svg-muted" font-size="12">Reference: MDU-FGT. Devices: FAZ-1, HQ-FGT, PC-HQ, SRV-WEB, MDU-FGT, PC-MDU.</text>
</svg><p class="cap">Each step reveals the next problem.</p></div>

<h3>Task 1: read the first message and compare with the reference</h3>
<p><b>Approach.</b> On HQ-FGT run <code>execute log fortianalyzer test-connectivity</code>. The answer is two words. Then run <code>show log fortianalyzer setting</code> on HQ-FGT and on MDU-FGT and compare the server line. <b>Why:</b> the message tells you which step of the ordered checks failed (chapter 3); the reference shows what correct looks like. <b>Look for:</b></p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    <span class="hl">set server "192.0.2.60"</span>
    set serial "FAZ-VMEV00000000"
end
HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>The Host Name is "-": nobody answered. The server differs from MDU-FGT by one digit. Correct it with <code>set server</code> inside <code>config log fortianalyzer setting</code>, and leave <code>end</code> to apply it. <b>Wrong turns:</b> blaming the network and checking routes before reading the address; deleting the serial line now (it is the second fault, and it is still needed, with a correct value); changing the FortiAnalyzer side, which has no fault at this step.</p>

<h3>Task 2: the message changed, the second fault appears</h3>
<p><b>Approach.</b> Run test-connectivity again. The message now has three words. Run <code>diagnose test application miglogd 6</code> on HQ-FGT: it prints both serial numbers. <b>Why:</b> the FortiAnalyzer now answers, so the connection step passed, and the check moved on to the serial list. <b>Look for:</b></p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Serial number mismatch</span>
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=disconnected: FortiAnalyzer serial number FAZ-VMEVYXM9SG00 is not in the serial list of this FortiGate (FAZ-VMEV00000000) mode=udp upload=realtime data-path=-</pre>
<p>The FortiGate was given a placeholder serial. Read the real one with <code>get system status</code> on FAZ-1 (the line "Serial Number") and put it in the <code>serial</code> setting of HQ-FGT. Copy and paste; typing a serial by hand is how a third fault is born. <b>Wrong turns:</b> editing the serial on MDU-FGT; trusting the FortiGate side value because "it was in the ticket"; disabling the serial check instead of fixing it (this weakens the setup and is not what the task asks).</p>

<h3>Task 3: connected is not registered</h3>
<p><b>Approach.</b> Test again. Now the message is the friendly one, but read the Registration line. <b>Look for:</b> "Connection: Allow" together with "Registration: unregistered". Then on FAZ-1 register HQ-FGT in the ADOM root (<code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>, a stand-in for the GUI), open web sessions from PC-HQ, and read the traffic logs in Log View. <b>Why in this order:</b> logs sent before registration are discarded, so the web requests must come after. <b>Proof:</b></p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (2):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
MDU-FGT         FGVMEV1JOS6TJ000    root        192.0.2.12      up    0/0/0                     -
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:52:14
<span class="hl">Unregistered devices (0)</span></pre>
<p>HQ-FGT shows 3 traffic logs. MDU-FGT shows 0 because nobody generated traffic at the store; that is not a fault. Then <code>execute fazui logview root HQ-FGT traffic</code> shows the entries with srcip 10.10.0.10 (PC-HQ) and dstip 192.0.2.80. <b>Wrong turns:</b> registering first and generating traffic before the connection works; looking at MDU-FGT for the proof; using a different ADOM name than the task asks.</p>

<h3>Task 4: the Security Fabric question</h3>
<p>"Authorizing a FortiGate in a FortiManager does not register it in the FortiAnalyzer. Is that right?" Chapter 5 answers it: yes. The two systems keep separate device tables and the FortiManager is not even part of this lab.</p>

<div class="eg"><p><b>Worked example of the log you keep.</b> Before: Connection timeout, server 192.0.2.60. After step 1: Serial number mismatch. After step 2: Allow, unregistered. After step 3: Allow, registered, 3/0/0, a traffic log with srcip 10.10.0.10. Four lines, four steps, nothing guessed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing two settings in one go. Declaring victory at "Connection: Allow". Registering a device in the ADOM root while the task text names another place. Assuming the serial in a change ticket is right without comparing it with the FortiAnalyzer status output.</p></div>

<div class="exam"><p><b>Exam traps.</b> The first fault hides the second: timeout, then serial mismatch. Allow plus unregistered means logs are dropped. Registration starts storage from the next log.</p></div>

<div class="scn"><h4>The change ticket that was half right</h4><p>A copy-paste template for a new site contained the FortiAnalyzer address with a typo and a placeholder serial. The installer saw "timeout", fixed the address and went home when the message changed. The next day the serial mismatch was still there. A runbook step "test again until Allow and a log" would have caught it on the first evening.</p><p><b>Lesson:</b> do not leave until you have seen a log in Log View.</p></div>

<div class="iv"><p class="q">"After fixing the first error, the message changed. What does that tell you?"</p><p>It tells me that the first check now passes and the system reached the next one. I keep fixing in the documented order until the connection is Allow, then verify registration and a real log. I would not close the ticket on the connection line alone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the exact message and the Host Name line; compare with a working reference device.</li>
<li>Timeout hides serial mismatch; fix in order and test after each change.</li>
<li>Copy the serial from the FortiAnalyzer status output, never type it by hand.</li>
<li>Allow plus unregistered still discards logs; register, then generate traffic.</li>
<li>Authorization in FortiManager and registration in FortiAnalyzer are separate.</li>
</ul></div>
`,hi:`
<p>Naye employee ko laptop milta hai, par login nahi hota. IT galat password theek karta hai. Ab login chalta hai, par mailbox missing hai. Do faults, ek ke baad ek, aur doosra pehle ke jaane tak dikha hi nahi. Ye troubleshooting lab (type: troubleshoot, lagbhag 35 minutes) firewall ke liye bilkul wahi hai. Head-office FortiGate HQ-FGT ko FAZ-1 ko log karna hai jaise Madurai store karta hai. Change ticket kal raat apply hua aur kuch nahi aa raha.</p>

<h3>Goal</h3>
<p>Connection fix karo, serial number problem fix karo, HQ-FGT ko ADOM root mein register karo, prove karo ki traffic logs store ho rahe hain, aur ek Security Fabric sawal ka jawab do. MDU-FGT pehle se chalta hai: wahi aapka reference hai. Key skill hai ek cheez badalna, dobara test karna aur naya message padhna.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab fa-fabric-ts plan">
<rect x="10" y="26" width="140" height="64" rx="8" fill="#fed7aa"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Fault 1</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">timeout</text>
<rect x="170" y="26" width="140" height="64" rx="8" fill="#fed7aa"/><text x="240" y="52" text-anchor="middle" class="svg-ink" font-size="13">Fault 2</text><text x="240" y="70" text-anchor="middle" class="svg-muted" font-size="12">serial mismatch</text>
<rect x="330" y="26" width="140" height="64" rx="8" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">Register</text><text x="400" y="70" text-anchor="middle" class="svg-muted" font-size="12">ADOM root</text>
<rect x="490" y="26" width="140" height="64" rx="8" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="560" y="70" text-anchor="middle" class="svg-muted" font-size="12">Log View mein log</text>
<line x1="150" y1="58" x2="170" y2="58" stroke="#64748b" stroke-width="2"/><line x1="310" y1="58" x2="330" y2="58" stroke="#64748b" stroke-width="2"/><line x1="470" y1="58" x2="490" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="10" y="125" class="svg-muted" font-size="12">Reference: MDU-FGT. Devices: FAZ-1, HQ-FGT, PC-HQ, SRV-WEB, MDU-FGT, PC-MDU.</text>
</svg><p class="cap">Har step agli problem dikhata hai.</p></div>

<h3>Task 1: pehla message padho aur reference se compare karo</h3>
<p><b>Approach.</b> HQ-FGT par <code>execute log fortianalyzer test-connectivity</code> chalao. Jawab do words ka hai. Phir HQ-FGT aur MDU-FGT dono par <code>show log fortianalyzer setting</code> chalao aur server line compare karo. <b>Kyun:</b> message batata hai ki ordered checks (chapter 3) ka kaun sa step fail hua; reference dikhata hai ki sahi kaisa dikhta hai. <b>Kya dekhna hai:</b></p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    <span class="hl">set server "192.0.2.60"</span>
    set serial "FAZ-VMEV00000000"
end
HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>Host Name "-" hai: kisi ne jawab nahi diya. Server MDU-FGT se ek digit alag hai. <code>config log fortianalyzer setting</code> ke andar <code>set server</code> se sahi karo, aur apply karne ke liye <code>end</code> chalao. <b>Wrong turns:</b> address padhne se pehle network ko blame karke routes check karna; serial line abhi delete kar dena (wo doosra fault hai, aur sahi value ke saath abhi bhi chahiye); FortiAnalyzer side badalna, jahan is step par koi fault nahi.</p>

<h3>Task 2: message badla, doosra fault dikha</h3>
<p><b>Approach.</b> Test dobara chalao. Message ab teen words ka hai. HQ-FGT par <code>diagnose test application miglogd 6</code> chalao: wo dono serial numbers print karta hai. <b>Kyun:</b> FortiAnalyzer ab jawab deta hai, yaani connection step pass hua, aur check serial list par pahunch gaya. <b>Kya dekhna hai:</b></p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Serial number mismatch</span>
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=disconnected: FortiAnalyzer serial number FAZ-VMEVYXM9SG00 is not in the serial list of this FortiGate (FAZ-VMEV00000000) mode=udp upload=realtime data-path=-</pre>
<p>FortiGate ko placeholder serial diya gaya tha. FAZ-1 par <code>get system status</code> se asli serial padho (line "Serial Number") aur HQ-FGT ki <code>serial</code> setting mein daalo. Copy aur paste karo; serial haath se type karna teesra fault paida karne ka tarika hai. <b>Wrong turns:</b> MDU-FGT par serial edit karna; FortiGate side ki value par bharosa karna kyunki "ticket mein thi"; serial check ko fix karne ki jagah disable karna (isse setup kamzor hota hai aur task ye nahi maangta).</p>

<h3>Task 3: connected ka matlab registered nahi</h3>
<p><b>Approach.</b> Dobara test karo. Ab message friendly hai, par Registration line padho. <b>Kya dekhna hai:</b> "Connection: Allow" ke saath "Registration: unregistered". Phir FAZ-1 par HQ-FGT ko ADOM root mein register karo (<code>execute fazui register &lt;device&gt; &lt;adom&gt;</code>, GUI ka stand-in), PC-HQ se web sessions kholo, aur Log View mein traffic logs padho. <b>Is order mein kyun:</b> registration se pehle bheje logs discard hote hain, isliye web requests baad mein aani chahiye. <b>Proof:</b></p>
<pre class="out">FAZ-1 # diagnose device list
Registered devices (2):
NAME            SERIAL              ADOM        IP              CONN  LOGS (traffic/utm/event)  LAST LOG
MDU-FGT         FGVMEV1JOS6TJ000    root        192.0.2.12      up    0/0/0                     -
HQ-FGT          FGVMEV1RGF38I000    root        192.0.2.11      up    3/0/0                     2026-10-12 20:52:14
<span class="hl">Unregistered devices (0)</span></pre>
<p>HQ-FGT ke 3 traffic logs dikhte hain. MDU-FGT ke 0 hain kyunki store par kisi ne traffic nahi banaya; ye fault nahi hai. Phir <code>execute fazui logview root HQ-FGT traffic</code> srcip 10.10.0.10 (PC-HQ) aur dstip 192.0.2.80 wali entries dikhata hai. <b>Wrong turns:</b> connection chalne se pehle register karke traffic banana; proof ke liye MDU-FGT dekhna; task jo ADOM naam kehta hai usse alag ADOM use karna.</p>

<h3>Task 4: Security Fabric ka sawal</h3>
<p>"FortiManager mein FortiGate authorize karne se wo FortiAnalyzer mein register nahi hota. Kya yeh sahi hai?" Chapter 5 jawab deta hai: yes. Dono systems alag device tables rakhte hain aur FortiManager is lab ka hissa bhi nahi hai.</p>

<div class="eg"><p><b>Jo log aap rakhte ho uska worked example.</b> Pehle: Connection timeout, server 192.0.2.60. Step 1 ke baad: Serial number mismatch. Step 2 ke baad: Allow, unregistered. Step 3 ke baad: Allow, registered, 3/0/0, srcip 10.10.0.10 wala traffic log. Chaar lines, chaar steps, kuch guess nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath do settings badalna. "Connection: Allow" par jeet declare kar dena. Device ko ADOM root mein register karna jabki task text kisi aur jagah ka naam leta hai. Change ticket ka serial FortiAnalyzer status output se compare kiye bina sahi maan lena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Pehla fault doosre ko chhupata hai: timeout, phir serial mismatch. Allow plus unregistered ka matlab logs drop hote hain. Registration agle log se storage start karti hai.</p></div>

<div class="scn"><h4>Aadha sahi change ticket</h4><p>Naye site ke copy-paste template mein FortiAnalyzer address typo ke saath aur placeholder serial tha. Installer ne "timeout" dekha, address sahi kiya aur message badalte hi ghar chala gaya. Agle din serial mismatch abhi bhi tha. Runbook ka step "Allow aur ek log milne tak test karo" pehli shaam hi pakad leta.</p><p><b>Lesson:</b> Log View mein log dekhe bina mat jao.</p></div>

<div class="iv"><p class="q">"Pehla error fix karne ke baad message badal gaya. Ye aapko kya batata hai?"</p><p>Ye batata hai ki pehla check ab pass hota hai aur system agle tak pahunch gaya. Main documented order mein fix karta rehta hoon jab tak connection Allow na ho, phir registration aur ek asli log verify karta hoon. Sirf connection line par ticket close nahi karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exact message aur Host Name line padho; working reference device se compare karo.</li>
<li>Timeout serial mismatch ko chhupata hai; order mein fix karo aur har change ke baad test karo.</li>
<li>Serial FortiAnalyzer status output se copy karo, haath se type mat karo.</li>
<li>Allow plus unregistered abhi bhi logs discard karta hai; register karo, phir traffic banao.</li>
<li>FortiManager mein authorization aur FortiAnalyzer mein registration alag hain.</li>
</ul></div>
`}};export{e as default};