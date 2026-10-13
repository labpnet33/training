var e={id:`what-is-an-adom`,h:{en:`What an ADOM is for on a FortiAnalyzer`,hi:`FortiAnalyzer par ADOM kis kaam aata hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why one FortiAnalyzer should not keep every log in one big heap, what an administrative domain (ADOM) is, the three rules that matter (one device lives in exactly one ADOM, the root ADOM always exists, each ADOM has its own storage settings), and what you will do in the three labs of this module. <b>Prerequisites:</b> the module on log flow and device registration (a FortiGate sends logs to FAZ-1 and must be registered there), plus FortiGate basics. You should know what a traffic log is.</p></div>

<p>Imagine a big office building with one shared store room. Accounts, sales and the security guard all throw their papers into the same room. After a year nobody can find anything, the guard can read salary slips, and when the room is full somebody throws away the oldest boxes without asking whose they were. The sensible fix is simple: give each team its own locked cupboard with its own size limit. On a FortiAnalyzer, that cupboard is an ADOM.</p>

<h3>The idea, step by step</h3>
<p>An <b>ADOM</b> (administrative domain) is a named container inside FortiAnalyzer. It holds the registered devices assigned to it and every log those devices send. Logs of one ADOM are stored, searched, reported and deleted separately from the logs of another ADOM. In the real product an administrator can also be limited to some ADOMs, so the Chennai analysts see Chennai logs only. That per-administrator permission is theory in this course; the simulator does not model it.</p>
<p>The three rules to remember:</p>
<ol>
<li><b>One device, one ADOM.</b> A FortiGate is registered by its serial number, and a serial number can sit in only one device row. So its logs go to exactly one place.</li>
<li><b>root always exists.</b> Before ADOM mode is switched on, the unit works in a single-ADOM way and everything is stored in <code>root</code>. After ADOM mode is on, root is still there (it is built in) but you normally place devices in ADOMs that you created.</li>
<li><b>Each ADOM has its own storage settings.</b> Quota, how long logs stay searchable and how long they stay in the archive are decided per ADOM. Chapter 4 covers this.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FAZ-1 with three ADOM compartments">
<rect x="20" y="14" width="600" height="206" rx="10" fill="#e2e8f0"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">FAZ-1 (192.0.2.6)</text>
<rect x="40" y="56" width="170" height="146" rx="8" fill="#ddd6fe"/><text x="125" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM Corporate</text><text x="125" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT logs</text><text x="125" y="124" text-anchor="middle" class="svg-muted" font-size="12">own quota</text><text x="125" y="144" text-anchor="middle" class="svg-muted" font-size="12">own retention</text>
<rect x="235" y="56" width="170" height="146" rx="8" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM Retail</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT logs</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">TRY-FGT logs</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">own quota</text>
<rect x="430" y="56" width="170" height="146" rx="8" fill="#bbf7d0"/><text x="515" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM root</text><text x="515" y="104" text-anchor="middle" class="svg-muted" font-size="12">built in</text><text x="515" y="124" text-anchor="middle" class="svg-muted" font-size="12">always present</text>
</svg><p class="cap">One FortiAnalyzer, separate compartments. A device appears in one compartment only.</p></div>

<h3>Why it matters</h3>
<p>Kaveri Retail has head-office staff in Chennai and store staff for Madurai and Trichy. Head office wants 60 days of searchable logs; the store audit asks for different numbers. Without ADOMs one setting must fit all, one noisy branch can use up the disk of everybody, and any analyst who can open Log View can read every log. With ADOMs the noisy branch only fills its own quota, and each team opens only its own logs.</p>

<div class="eg"><p><b>Worked example.</b> Three FortiGates log to FAZ-1: HQ-FGT (192.0.2.11), MDU-FGT (192.0.2.12) and TRY-FGT (192.0.2.13). Plan: HQ-FGT goes to the ADOM Corporate; MDU-FGT and TRY-FGT go to the ADOM Retail. Later the Madurai staff run a web search in Log View of Retail and see only Madurai and Trichy sessions. A session of PC-HQ never appears there, because its log is in Corporate.</p></div>

<h3>What the unit says before ADOM mode</h3>
<p>On a fresh unit ADOM mode is off. This is what the simulator prints when you list the ADOMs and then try to register a device in an ADOM that cannot exist yet:</p>
<pre class="out">FAZ-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	<span class="hl">root</span>		7.6	GMS	0
(ADOMs are disabled: only the root ADOM is in use)

FAZ-1 # execute fazui register HQ-FGT Corporate
ADOMs are disabled: only the root ADOM can be used. Enable them first (config system global, set adom-status enable).</pre>

<div class="note"><p><b>GUI or CLI?</b> In the real product ADOMs are created and assigned in the GUI. The simulator lets you do it from the CLI: <code>config system global</code>, <code>config dvmdb adom</code> and the stand-in command <code>execute fazui register</code>. The name <code>execute fazui ...</code> does not exist on a real FortiAnalyzer.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking an ADOM is a network segment or a VDOM: it is only a way to organise logs and administrators on the FortiAnalyzer, and it never touches user traffic. Another mistake is expecting a device to be in two ADOMs "to share the logs". It cannot. If two teams need the same logs, use one ADOM and give both teams access.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which ADOM exists from the start?" Answer: root. "Can one serial number be registered twice?" No, one row only. "Are ADOMs on by default?" No, ADOM mode is off until you switch it on.</p></div>

<div class="scn"><h4>The branch that filled the disk</h4><p>A retailer kept all logs in one heap. A branch with a misbehaving application produced thousands of logs a minute, the shared disk reached its limit and the oldest head-office logs were overwritten. When the finance team asked for last quarter's evidence, part of it was gone. After the engineer moved the branches to their own ADOM with its own quota, the noisy branch could only damage its own history.</p><p><b>Lesson:</b> an ADOM is a fence around storage as much as around visibility.</p></div>

<div class="iv"><p class="q">"Why use ADOMs on a FortiAnalyzer?"</p><p>To separate logs, reports and administrators by business unit, region or customer, and to give each unit its own quota and retention. Add the three rules: one device in one ADOM, root always exists, storage settings are per ADOM. Mention that the per-administrator permissions belong to the real product.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An ADOM is a container for devices and their logs; it never touches user traffic.</li>
<li>One device (serial number) lives in exactly one ADOM.</li>
<li>root always exists; other ADOMs need ADOM mode to be switched on first.</li>
<li>Quota and retention are decided per ADOM.</li>
<li>In the real product ADOMs are a GUI task; the simulator offers CLI stand-ins.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Ek FortiAnalyzer par saare logs ek bade dher mein kyun nahi rakhne chahiye, administrative domain (ADOM) kya hota hai, teen zaroori rules (ek device sirf ek ADOM mein rehta hai, root ADOM hamesha hota hai, har ADOM ki apni storage settings hoti hain), aur is module ke teen labs mein aap kya karoge. <b>Prerequisites:</b> log flow aur device registration wala module (FortiGate FAZ-1 ko logs bhejta hai aur wahan registered hona chahiye), aur FortiGate basics. Aapko pata hona chahiye ki traffic log kya hota hai.</p></div>

<p>Ek bade office building ki kalpana karo jisme ek hi shared store room hai. Accounts, sales aur security guard sab apne papers usi room mein daal dete hain. Saal bhar baad kisi ko kuch milta nahi, guard salary slips padh sakta hai, aur room full ho jaye to koi bina poochhe sabse purane boxes phenk deta hai. Sahi hal simple hai: har team ko apni locked almari do, apni size limit ke saath. FortiAnalyzer par wo almari ADOM hai.</p>

<h3>Idea, step by step</h3>
<p><b>ADOM</b> (administrative domain) FortiAnalyzer ke andar ek named container hai. Isme us ADOM ko assign hue registered devices aur unke bheje saare logs hote hain. Ek ADOM ke logs doosre ADOM ke logs se alag store, search, report aur delete hote hain. Real product mein administrator ko kuch ADOMs tak limit bhi kiya ja sakta hai, taaki Chennai ke analysts sirf Chennai ke logs dekhein. Ye per-administrator permission is course mein theory hai; simulator ise model nahi karta.</p>
<p>Teen rules yaad rakho:</p>
<ol>
<li><b>Ek device, ek ADOM.</b> FortiGate serial number se register hota hai, aur ek serial number sirf ek device row mein ho sakta hai. Isliye uske logs exactly ek jagah jate hain.</li>
<li><b>root hamesha hota hai.</b> ADOM mode on karne se pehle unit single-ADOM tareeke se chalta hai aur sab kuch <code>root</code> mein store hota hai. ADOM mode on hone ke baad bhi root rehta hai (built in), par aap aam taur par devices ko apne banaye ADOMs mein rakhte ho.</li>
<li><b>Har ADOM ki apni storage settings.</b> Quota, logs kitne din searchable rahenge aur archive mein kitne din, ye sab per ADOM tay hota hai. Chapter 4 mein iska detail hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="FAZ-1 aur teen ADOM compartments">
<rect x="20" y="14" width="600" height="206" rx="10" fill="#e2e8f0"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">FAZ-1 (192.0.2.6)</text>
<rect x="40" y="56" width="170" height="146" rx="8" fill="#ddd6fe"/><text x="125" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM Corporate</text><text x="125" y="104" text-anchor="middle" class="svg-muted" font-size="12">HQ-FGT ke logs</text><text x="125" y="124" text-anchor="middle" class="svg-muted" font-size="12">apna quota</text><text x="125" y="144" text-anchor="middle" class="svg-muted" font-size="12">apni retention</text>
<rect x="235" y="56" width="170" height="146" rx="8" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM Retail</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT ke logs</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">TRY-FGT ke logs</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">apna quota</text>
<rect x="430" y="56" width="170" height="146" rx="8" fill="#bbf7d0"/><text x="515" y="80" text-anchor="middle" class="svg-ink" font-size="13">ADOM root</text><text x="515" y="104" text-anchor="middle" class="svg-muted" font-size="12">built in</text><text x="515" y="124" text-anchor="middle" class="svg-muted" font-size="12">hamesha present</text>
</svg><p class="cap">Ek FortiAnalyzer, alag compartments. Device sirf ek compartment mein dikhta hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Kaveri Retail ke Chennai mein head-office staff hain aur Madurai aur Trichy ke liye store staff. Head office ko 60 din ke searchable logs chahiye; store audit ko alag numbers chahiye. ADOMs ke bina ek hi setting sab par lagti hai, ek noisy branch sabki disk bhar sakti hai, aur jo analyst Log View khol sakta hai wo har log padh sakta hai. ADOMs ke saath noisy branch sirf apna quota bharti hai, aur har team sirf apne logs kholti hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen FortiGates FAZ-1 ko log bhejte hain: HQ-FGT (192.0.2.11), MDU-FGT (192.0.2.12) aur TRY-FGT (192.0.2.13). Plan: HQ-FGT ADOM Corporate mein jayega; MDU-FGT aur TRY-FGT ADOM Retail mein. Baad mein Madurai staff Retail ke Log View mein web search chalata hai aur sirf Madurai aur Trichy ke sessions dekhta hai. PC-HQ ka session wahan kabhi nahi aata, kyunki uska log Corporate mein hai.</p></div>

<h3>ADOM mode se pehle unit kya kehta hai</h3>
<p>Fresh unit par ADOM mode off hota hai. Jab aap ADOMs list karte ho aur aise ADOM mein device register karne ki koshish karte ho jo abhi ban hi nahi sakta, simulator ye print karta hai:</p>
<pre class="out">FAZ-1 # diagnose dvm adom list
--- There are currently 1 ADOMs ---
OID	STATE	NAME		VERSION	MODE	DEVICES
3	enabled	<span class="hl">root</span>		7.6	GMS	0
(ADOMs are disabled: only the root ADOM is in use)

FAZ-1 # execute fazui register HQ-FGT Corporate
ADOMs are disabled: only the root ADOM can be used. Enable them first (config system global, set adom-status enable).</pre>

<div class="note"><p><b>GUI ya CLI?</b> Real product mein ADOMs GUI mein banaye aur assign kiye jate hain. Simulator mein aap ye CLI se kar sakte ho: <code>config system global</code>, <code>config dvmdb adom</code> aur stand-in command <code>execute fazui register</code>. <code>execute fazui ...</code> naam real FortiAnalyzer par exist nahi karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> ADOM ko network segment ya VDOM samajhna: ye sirf FortiAnalyzer par logs aur administrators organise karne ka tareeka hai, user traffic ko kabhi nahi chhoota. Doosri galti: "logs share karne ke liye" device ko do ADOMs mein expect karna. Ye possible nahi hai. Do teams ko same logs chahiye to ek ADOM rakho aur dono teams ko access do.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Shuru se kaun sa ADOM exist karta hai?" Jawab: root. "Kya ek serial number do baar register ho sakta hai?" Nahi, sirf ek row. "Kya ADOMs default se on hote hain?" Nahi, ADOM mode aap on karte ho tab tak off rehta hai.</p></div>

<div class="scn"><h4>Branch jisne disk bhar di</h4><p>Ek retailer ne saare logs ek dher mein rakhe the. Ek branch ki kharab application har minute hazaron logs banane lagi, shared disk limit tak pahunch gayi aur head office ke sabse purane logs overwrite ho gaye. Jab finance team ne pichhli quarter ka evidence manga, uska ek hissa gayab tha. Engineer ne branches ko unke apne ADOM mein, apne quota ke saath, move kiya; ab noisy branch sirf apni history bigaad sakti thi.</p><p><b>Lesson:</b> ADOM visibility ke saath saath storage ke around bhi ek fence hai.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer par ADOMs kyun use karte hain?"</p><p>Logs, reports aur administrators ko business unit, region ya customer ke hisaab se alag karne ke liye, aur har unit ko apna quota aur retention dene ke liye. Teen rules jodo: ek device ek ADOM, root hamesha hota hai, storage settings per ADOM. Batao ki per-administrator permissions real product ka hissa hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOM devices aur unke logs ka container hai; user traffic ko kabhi nahi chhoota.</li>
<li>Ek device (serial number) exactly ek ADOM mein rehta hai.</li>
<li>root hamesha hota hai; baaki ADOMs ke liye pehle ADOM mode on karna padta hai.</li>
<li>Quota aur retention per ADOM tay hote hain.</li>
<li>Real product mein ADOMs GUI task hain; simulator CLI stand-ins deta hai.</li>
</ul></div>
`}};export{e as default};