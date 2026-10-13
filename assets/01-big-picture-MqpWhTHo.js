var e={id:`big-picture`,h:{en:`Welcome: what you will learn and the big picture`,hi:`Swagat: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn what network automation is, why engineers use it, and how a tiny Python script can log in to many routers for you, run commands and report back. By the end you will have run two real scripts in the lab: one that reads the hostname and uptime of every router, and one that pushes the same NTP setting to five routers and checks the result. This is the first module of the CCNP Automation (350-901 AUTOCOR) track and also the start of the "Python for Network Engineers" track.</p>
<p><b>Prerequisites.</b> You should know what a router is, what an IP address is, and how to type <code>show</code> commands on a Cisco-style CLI. That is all. You do <b>not</b> need to know any programming. We assume you have never written a line of code, and we explain every line we show.</p>
<h3>Analogy: a recipe card and a tireless helper</h3>
<p>Think of a recipe card for tea: boil water, add leaves, add milk, wait two minutes, pour. A new cook can follow it exactly and get the same tea every time. A <b>script</b> is a recipe card for a computer. You write the steps once, in a text file, in a language the computer understands (we use <b>Python</b>). The computer then follows the steps exactly, as many times as you ask, without getting tired or bored. Your helper never skips step 3 because it is 2 a.m.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Script to routers">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">You</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">write a script</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">AUTO host</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">runs python3</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">SSH (port 22)</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">encrypted login</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1  R2  R3</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">change + verify</text>
</svg><p class="cap">The picture for the whole module: you write a script, a host runs it, SSH carries it to the routers.</p></div>
<h3>The lab world you will work in</h3>
<p>Every lab in this module uses an <b>automation host</b> called <code>AUTO</code>. It is a small Linux-like machine on the management network 10.99.0.0/24 (AUTO is 10.99.0.100). It is joined through a switch to routers such as R1 (10.99.0.1) and R2 (10.99.0.2). The routers accept SSH logins for a lab user named <code>netops</code>. The password in the lab is the placeholder <code>NK@2026</code>; never reuse a lab password in real life. On AUTO you will use these commands:</p>
<pre class="out">AUTO&gt; ls
first_script.py</pre>
<p><code>ls</code> lists the files on the host. Here the only file is <code>first_script.py</code>, left by a senior engineer. You will open it in chapter 3 and run it in chapter 4.</p>
<h3>The nine chapters</h3>
<ol>
<li>Big picture (this chapter)</li>
<li>Why automate, and the automation ladder</li>
<li>Python and your first script file</li>
<li>Your first script, line by line</li>
<li>Lists and loops: one idea, many routers</li>
<li>Pushing configuration safely</li>
<li>Reading errors without panic</li>
<li>Verifying and safe habits</li>
<li>Summary and checklist</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Your manager asks for a new NTP server on 5 branch routers. By hand: five logins, five <code>conf t</code> sessions, five <code>write memory</code>. With a script: one command, <code>python3 ntp_push.py</code>, and a printed report. Chapter 6 does exactly this.</p></div>
<div class="warn"><p><b>Common mistake.</b> Believing "automation means I do not need networking knowledge". The script only types what you tell it to type. If you do not know the right command, a script just types the wrong command faster, on more devices.</p></div>
<div class="exam"><p><b>Exam trap.</b> The 350-901 AUTOCOR exam tests automation concepts, Python reading skills, APIs, data formats and tools. You are not asked to write long programs from nothing, but you must read short Python and spot what it does or why it fails. This module builds that reading habit.</p></div>
<div class="scn"><h4>The 2 a.m. typo</h4><p>A network team changed a banner on 40 switches by hand over a weekend. On switch 27 a tired engineer typed a wrong VLAN number in a pasted block, and nobody noticed until Monday. After that, the team wrote one small script holding the exact lines. They reviewed the lines once, in daylight, and then ran the script on all 40.</p><p><b>Lesson:</b> automation moves the careful thinking to one place (the file) and the typing to the computer.</p></div>
<div class="iv"><p class="q">"Why would a network engineer learn Python?"</p><p>Strong answer: to remove repetitive, error-prone manual work (the same change on many devices), to get consistent results with a record of what was done, and to be able to read and write the scripts and API calls that modern tools are built on. Add that automation does not replace networking knowledge; it multiplies it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A script is a recipe card: steps written once, followed exactly many times.</li>
<li>Python is the language we use; the lab host is called AUTO.</li>
<li>The script reaches routers over SSH using the lab user netops.</li>
<li>You need networking knowledge first; automation multiplies it.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki network automation kya hai, engineers ise kyun use karte hain, aur ek chhota Python script kaise aapke liye kai routers par login karke commands chalata hai aur report deta hai. Module ke end tak aap lab mein do asli scripts chala chuke hoge: ek jo har router ka hostname aur uptime padhta hai, aur doosra jo paanch routers par same NTP setting push karke result check karta hai. Yeh CCNP Automation (350-901 AUTOCOR) track ka pehla module hai aur "Python for Network Engineers" track ki shuruaat bhi.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki router kya hai, IP address kya hai, aur Cisco-style CLI par <code>show</code> commands kaise type karte hain. Bas itna hi. Aapko programming aani zaroori <b>nahi</b> hai. Hum maan ke chalte hain ki aapne kabhi code ki ek line bhi nahi likhi, aur hum jo bhi line dikhate hain uska matlab samjhate hain.</p>
<h3>Analogy: recipe card aur ek na thakne wala helper</h3>
<p>Chai ki recipe card socho: paani ubalo, patti daalo, doodh daalo, do minute ruko, cup mein daalo. Naya cook ise bilkul follow karke har baar same chai bana leta hai. <b>Script</b> computer ke liye recipe card hai. Aap steps ek baar text file mein likhte ho, aisi language mein jo computer samajhta hai (hum <b>Python</b> use karenge). Phir computer steps ko bilkul waise hi, jitni baar bolo utni baar, bina thake aur bina bore hue follow karta hai. Aapka helper raat ke 2 baje bhi step 3 skip nahi karta.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Script to routers">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">Aap</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">script likho</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">AUTO host</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">python3 chalata hai</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">SSH (port 22)</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">encrypted login</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1  R2  R3</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">change + verify</text>
</svg><p class="cap">Poore module ki tasveer: aap script likhte ho, host use chalata hai, SSH use routers tak pahunchata hai.</p></div>
<h3>Lab ki duniya jahan aap kaam karoge</h3>
<p>Is module ka har lab ek <b>automation host</b> use karta hai jiska naam <code>AUTO</code> hai. Yeh management network 10.99.0.0/24 par ek chhoti Linux-jaisi machine hai (AUTO ka address 10.99.0.100). Yeh ek switch ke through R1 (10.99.0.1) aur R2 (10.99.0.2) jaise routers se juda hai. Routers lab user <code>netops</code> ke liye SSH login accept karte hain. Lab ka password placeholder <code>NK@2026</code> hai; asli zindagi mein lab password kabhi reuse mat karna. AUTO par aap yeh commands use karoge:</p>
<pre class="out">AUTO&gt; ls
first_script.py</pre>
<p><code>ls</code> host ki files ki list dikhata hai. Yahan sirf <code>first_script.py</code> hai, jo ek senior engineer ne chhodi hai. Aap ise chapter 3 mein khologe aur chapter 4 mein chalaoge.</p>
<h3>Nau chapters</h3>
<ol>
<li>Big picture (yeh chapter)</li>
<li>Automate kyun karein, aur automation ki seedhi</li>
<li>Python aur aapki pehli script file</li>
<li>Aapki pehli script, line by line</li>
<li>Lists aur loops: ek idea, kai routers</li>
<li>Configuration safely push karna</li>
<li>Errors bina ghabraye padhna</li>
<li>Verify karna aur safe habits</li>
<li>Summary aur checklist</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Manager 5 branch routers par naya NTP server maangta hai. Haath se: paanch login, paanch <code>conf t</code> sessions, paanch <code>write memory</code>. Script se: ek command, <code>python3 ntp_push.py</code>, aur ek printed report. Chapter 6 bilkul yahi karta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "automation ka matlab networking knowledge ki zaroorat nahi". Script wahi type karta hai jo aap bolte ho. Agar sahi command nahi pata, to script galat command sirf zyada tezi se aur zyada devices par type kar dega.</p></div>
<div class="exam"><p><b>Exam trap.</b> 350-901 AUTOCOR exam automation concepts, Python padhne ki skill, APIs, data formats aur tools test karta hai. Aapse zero se lambe programs likhne ko nahi kaha jaata, lekin chhota Python padhna aur samajhna ki woh kya karta hai ya kyun fail hua, aana chahiye. Yeh module wahi padhne ki aadat banata hai.</p></div>
<div class="scn"><h4>Raat 2 baje ka typo</h4><p>Ek network team ne weekend par 40 switches ka banner haath se badla. Switch 27 par thake hue engineer ne paste kiye block mein galat VLAN number type kar diya, aur Monday tak kisi ko pata nahi chala. Uske baad team ne ek chhota script likha jisme exact lines thi. Lines ko din ki roshni mein ek baar review kiya, phir script saare 40 par chala diya.</p><p><b>Lesson:</b> automation careful sochna ek jagah (file) mein rakhta hai aur typing computer par chhod deta hai.</p></div>
<div class="iv"><p class="q">"Ek network engineer Python kyun seekhe?"</p><p>Strong answer: repetitive, error-prone manual kaam hataane ke liye (same change kai devices par), consistent results aur kiye hue kaam ka record paane ke liye, aur un scripts aur API calls ko padhne-likhne ke liye jin par modern tools bane hain. Yeh bhi bolo ki automation networking knowledge ko replace nahi karta, multiply karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Script ek recipe card hai: steps ek baar likhe, kai baar bilkul waise follow hue.</li>
<li>Python woh language hai jo hum use karte hain; lab host ka naam AUTO hai.</li>
<li>Script routers tak SSH se lab user netops ke saath pahunchta hai.</li>
<li>Pehle networking knowledge chahiye; automation use multiply karta hai.</li>
</ul></div>
`}};export{e as default};