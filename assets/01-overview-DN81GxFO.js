var e={id:`overview`,h:{en:`Welcome to Junos: what you will learn and the big picture`,hi:`Junos mein swagat: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to drive the Junos command line the way a working engineer does: move between operational and configuration mode, build changes in a safe workspace, compare them, commit them, and undo them when something goes wrong. These are the User Interfaces objectives of the JNCIA-Junos exam (JN0-106) and the habits you will use on every Juniper device for the rest of your career.</p>
<p><b>Prerequisites.</b> You should know what a router, an IP address and a subnet mask are. You do not need to know any Juniper product. If you can use a text editor, you are ready.</p>

<h3>Analogy: Junos works like a document with a Publish button</h3>
<p>Imagine you edit a company website. You do not type directly on the live page. You edit a <b>draft</b>, read it, compare it with the live version, and only then press <b>Publish</b>. If the new page is broken, you press <b>Restore previous version</b>. Junos treats router configuration the same way. The live configuration is called the <b>active configuration</b>. Your draft is the <b>candidate configuration</b>. The Publish button is <code>commit</code>. The Restore button is <code>rollback</code>.</p>
<p>Older router operating systems apply every typed line instantly. One typo can cut the network. Junos was built so that nothing changes until you decide, and so that a bad change can be reversed in seconds.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Candidate and active configuration">
<rect x="20" y="60" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">your draft (set / delete)</text>
<rect x="235" y="60" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">Active</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">what the router runs now</text>
<rect x="450" y="60" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">Rollback 1 ... 49</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">saved older versions</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><text x="212" y="78" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<line x1="405" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/><text x="428" y="98" text-anchor="middle" class="svg-muted" font-size="12">old</text>
<path d="M535 130 Q535 175 320 175 Q105 175 105 130" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">rollback N loads an old version back into the candidate</text>
</svg><p class="cap">Edit the candidate, commit to activate, rollback to go back.</p></div>

<h3>What is inside a Junos device</h3>
<p>Every Junos device has two cooperating parts. The <b>Routing Engine (RE)</b> is the brain: it runs the operating system, the CLI, the routing protocols and builds the routing table. The <b>Packet Forwarding Engine (PFE)</b> is the muscle: it moves packets at wire speed using a forwarding table that the RE sends down. This split is the <b>separation of the control plane and the forwarding plane</b>. Because of it, a busy CLI session or a routing-protocol restart does not stop packets that are already being forwarded.</p>
<ul>
<li>Junos is built on a hardened FreeBSD kernel, with each function in its own protected process: <code>rpd</code> (routing), <code>mgd</code> (management and CLI), <code>chassisd</code> (hardware).</li>
<li>There is <b>one Junos</b> for routers, switches and firewalls, so the commands you learn here work across the whole product line.</li>
<li>Software is released on a regular train, and the same CLI syntax carries over between releases.</li>
</ul>

<h3>How you reach the CLI</h3>
<p>You connect with the <b>console</b> cable for the first setup, then with <b>SSH</b> over a management or data interface. After login you land in <b>operational mode</b>. From there you type <code>configure</code> to enter <b>configuration mode</b>. The next chapters walk through each step with the same lab devices you will use in the simulator: R1 and R2, linked by <code>ge-0/0/0</code>, addresses such as 10.20.1.1/30 and 10.20.1.2/30.</p>

<div class="eg"><p><b>Worked example.</b> R1 is racked in the Pune branch. You log in, type <code>configure</code>, then <code>set system host-name R1-PUNE</code>. The prompt still says <code>lab@R1#</code> because the name only changes in the active configuration. You type <code>commit</code> and the next prompt reads <code>lab@R1-PUNE#</code>. That one-line change followed by a visible effect is the whole Junos workflow in miniature.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing <code>set</code> commands and then expecting the network to change. Until you commit, the router keeps running the old configuration. Also, on a shared device, forgetting to commit leaves an uncommitted candidate that the next engineer may accidentally commit with your half-finished work.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks which configuration the device is <i>running</i>. The answer is always the active configuration, never the candidate. Know also that the RE and PFE are separate and that the RE runs the control plane.</p></div>

<div class="scn"><h4>The Friday change that nearly cut a branch</h4><p>An engineer pasted forty lines of interface changes into an older vendor's router. Line 12 had a typo, the uplink address changed instantly, and the branch lost contact before the rest was pasted. The next month the team moved to Junos. The same engineer pasted the same forty lines, ran <code>show | compare</code>, spotted the typo in the review, fixed it, and committed once. Nothing was ever live in a half-done state.</p><p><b>Lesson:</b> the candidate configuration turns risky bulk changes into reviewable, atomic changes.</p></div>

<div class="iv"><p class="q">"What is the difference between the candidate and the active configuration in Junos?"</p><p>The active configuration is what the device is running. The candidate is an editable copy that all <code>set</code> and <code>delete</code> commands change. Nothing takes effect until <code>commit</code> validates the candidate and makes it active, and the old active copy is saved as rollback 1. Mention <code>commit check</code>, <code>show | compare</code> and <code>commit confirmed</code> to show you work safely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos edits a candidate configuration; <code>commit</code> makes it active.</li>
<li>Up to 50 previous configurations are stored and can be reloaded with <code>rollback</code>.</li>
<li>The Routing Engine runs the control plane; the PFE forwards packets.</li>
<li>Operational mode prompt ends with <code>&gt;</code>; configuration mode prompt ends with <code>#</code>.</li>
<li>One Junos runs on routers, switches and firewalls.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Junos command line ko waise chalana seekhoge jaise ek working engineer chalata hai: operational aur configuration mode ke beech aana-jaana, ek safe workspace mein changes banana, unhe compare karna, commit karna, aur kuch bigad jaaye to undo karna. Yeh JNCIA-Junos exam (JN0-106) ke User Interfaces objectives hain aur aise habits hain jo aap har Juniper device par poore career mein use karoge.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki router, IP address aur subnet mask kya hote hain. Koi Juniper product jaanna zaroori nahi. Agar aap text editor chala lete ho to aap ready ho.</p>

<h3>Analogy: Junos ek document jaisa hai jisme Publish button hota hai</h3>
<p>Socho aap company ki website edit karte ho. Aap seedha live page par type nahi karte. Aap ek <b>draft</b> edit karte ho, use padhte ho, live version se compare karte ho, aur tab hi <b>Publish</b> dabate ho. Naya page toota ho to <b>Restore previous version</b> dabate ho. Junos router configuration ke saath bilkul yahi karta hai. Live configuration ko <b>active configuration</b> kehte hain. Aapka draft <b>candidate configuration</b> hai. Publish button <code>commit</code> hai. Restore button <code>rollback</code> hai.</p>
<p>Purane router operating systems har type ki hui line turant apply kar dete hain. Ek typo network kaat sakta hai. Junos is tarah banaya gaya hai ki jab tak aap decide na karo kuch nahi badalta, aur kharab change kuch seconds mein wapas ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Candidate aur active configuration">
<rect x="20" y="60" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">Candidate</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">aapka draft (set / delete)</text>
<rect x="235" y="60" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">Active</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">router abhi yahi chala raha hai</text>
<rect x="450" y="60" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">Rollback 1 ... 49</text><text x="535" y="110" text-anchor="middle" class="svg-muted" font-size="12">save kiye purane versions</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><text x="212" y="78" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<line x1="405" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/><text x="428" y="98" text-anchor="middle" class="svg-muted" font-size="12">purana</text>
<path d="M535 130 Q535 175 320 175 Q105 175 105 130" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">rollback N purana version candidate mein wapas load karta hai</text>
</svg><p class="cap">Candidate edit karo, activate karne ke liye commit karo, wapas jaane ke liye rollback.</p></div>

<h3>Junos device ke andar kya hota hai</h3>
<p>Har Junos device mein do cooperating parts hote hain. <b>Routing Engine (RE)</b> dimaag hai: yeh operating system, CLI, routing protocols chalata hai aur routing table banata hai. <b>Packet Forwarding Engine (PFE)</b> taakat hai: yeh RE se aayi forwarding table ke saath packets ko wire speed par aage bhejta hai. Is baant ko <b>control plane aur forwarding plane ka separation</b> kehte hain. Isi wajah se busy CLI session ya routing-protocol restart un packets ko nahi rokta jo already forward ho rahe hain.</p>
<ul>
<li>Junos ek hardened FreeBSD kernel par bana hai, aur har function apne protected process mein chalta hai: <code>rpd</code> (routing), <code>mgd</code> (management aur CLI), <code>chassisd</code> (hardware).</li>
<li>Routers, switches aur firewalls ke liye <b>ek hi Junos</b> hai, isliye yahan seekhe commands poori product line par chalte hain.</li>
<li>Software ek regular train par release hota hai, aur releases ke beech CLI syntax wahi rehta hai.</li>
</ul>

<h3>CLI tak kaise pahunchte hain</h3>
<p>Pehle setup ke liye <b>console</b> cable se connect karte hain, phir management ya data interface par <b>SSH</b> se. Login ke baad aap <b>operational mode</b> mein pahunchte ho. Wahan se <code>configure</code> type karke <b>configuration mode</b> mein jaate ho. Agle chapters har step simulator ke wahi lab devices ke saath dikhate hain: R1 aur R2, <code>ge-0/0/0</code> se jude hue, addresses jaise 10.20.1.1/30 aur 10.20.1.2/30.</p>

<div class="eg"><p><b>Worked example.</b> Pune branch mein R1 rack hua hai. Aap login karte ho, <code>configure</code> type karte ho, phir <code>set system host-name R1-PUNE</code>. Prompt abhi bhi <code>lab@R1#</code> dikhata hai kyunki naam sirf active configuration mein badalta hai. Aap <code>commit</code> likhte ho aur agla prompt <code>lab@R1-PUNE#</code> ho jaata hai. Ek line ka change aur phir dikhne wala effect — yahi poora Junos workflow chhote roop mein hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <code>set</code> commands type karke umeed karna ki network badal jaayega. Commit tak router purani configuration chalata rehta hai. Shared device par commit bhoolne se ek uncommitted candidate reh jaata hai jise agla engineer aapka adhoora kaam ke saath galti se commit kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai ki device kaunsi configuration <i>chala</i> raha hai. Jawab hamesha active configuration hai, candidate kabhi nahi. Yeh bhi yaad rakho ki RE aur PFE alag hain aur RE control plane chalata hai.</p></div>

<div class="scn"><h4>Friday ka change jisne branch lagbhag kaat diya</h4><p>Ek engineer ne purane vendor ke router mein interface changes ki chalis lines paste ki. Line 12 mein typo tha, uplink address turant badal gaya, aur baaki paste hone se pehle branch ka sampark toot gaya. Agle mahine team Junos par aayi. Usi engineer ne wahi chalis lines paste ki, <code>show | compare</code> chalaya, review mein typo pakda, theek kiya, aur ek baar commit kiya. Kuch bhi aadhi adhoori halat mein live nahi hua.</p><p><b>Lesson:</b> candidate configuration risky bulk changes ko reviewable, atomic changes bana deti hai.</p></div>

<div class="iv"><p class="q">"Junos mein candidate aur active configuration ka kya difference hai?"</p><p>Active configuration woh hai jo device chala raha hai. Candidate ek editable copy hai jise saare <code>set</code> aur <code>delete</code> commands badalte hain. <code>commit</code> candidate ko validate karke active banata hai tab tak kuch effect nahi hota, aur purani active copy rollback 1 ke roop mein save hoti hai. <code>commit check</code>, <code>show | compare</code> aur <code>commit confirmed</code> ka zikr karo taaki dikhe ki aap safely kaam karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos candidate configuration edit karta hai; <code>commit</code> use active banata hai.</li>
<li>50 tak purani configurations store hoti hain aur <code>rollback</code> se reload hoti hain.</li>
<li>Routing Engine control plane chalata hai; PFE packets forward karta hai.</li>
<li>Operational mode prompt <code>&gt;</code> par khatam hota hai; configuration mode prompt <code>#</code> par.</li>
<li>Routers, switches aur firewalls par ek hi Junos chalta hai.</li>
</ul></div>
`}};export{e as default};