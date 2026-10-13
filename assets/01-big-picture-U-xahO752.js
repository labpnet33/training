var e={id:`big-picture`,h:{en:`What you will learn: running a Junos network day to day`,hi:`Aap kya seekhoge: Junos network ko roz chalana`},body:{en:`
<p><b>What you will learn in this module.</b> A router that was configured last month is not finished work. It must be watched, tested, upgraded and sometimes rescued. This module teaches the everyday operator skills tested in the JNCIA-Junos exam (JN0-106) under Operational Monitoring and Maintenance: reading interface state and error counters, following logs live, testing paths with ping and traceroute, reaching other devices with ssh and telnet, installing software safely with a snapshot first, shutting a device down gracefully, and recovering a lost root password.</p>
<p><b>Prerequisites.</b> You should know how to log in to a Junos device, move between operational mode (<code>lab@R1&gt;</code>) and configuration mode (<code>lab@R1#</code>), and use <code>commit</code>. You should know what an IP address, a subnet and a default gateway are. You do not need to know OSPF in depth; the labs use a small OSPF network that is already built, and the later module jncia-ospf explains it fully.</p>

<h3>Analogy: the hospital ward round</h3>
<p>Think of a nurse doing a ward round. She does not operate on every patient. She checks a pulse (<b>show</b> commands: a snapshot), keeps a monitor attached to a worrying patient (<b>monitor</b> commands: a live view), asks a patient to answer a question to see if they respond (<b>ping</b>), follows a sick patient along the corridor to see where they collapse (<b>traceroute</b>), and calls a colleague in another ward (<b>ssh</b>). Before any serious treatment she takes a backup of the patient record (<b>snapshot</b>). A network engineer's daily work is the same: observe, test, then act carefully.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operate loop">
<rect x="10" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Observe</text><text x="75" y="75" text-anchor="middle" class="svg-muted" font-size="12">show, monitor</text>
<rect x="170" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="235" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Test</text><text x="235" y="75" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text>
<rect x="330" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Protect</text><text x="395" y="75" text-anchor="middle" class="svg-muted" font-size="12">snapshot, commit</text>
<rect x="490" y="30" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Act</text><text x="560" y="75" text-anchor="middle" class="svg-muted" font-size="12">fix, install, reboot</text>
<line x1="140" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="300" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="460" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<path d="M560 90 L560 140 L75 140 L75 90" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">verify again with show</text>
</svg><p class="cap">The operator loop. Every chapter in this module is one of these four steps.</p></div>

<h3>The three labs and the network behind them</h3>
<p>You will practise on small networks of Junos routers named R1, R2, R3 (sometimes R4), a PC1 and sometimes a server SRV. Interfaces are named <code>ge-0/0/0</code>, <code>ge-0/0/1</code> and so on, and every router has a loopback <code>lo0</code>. Addresses come from the 10.x private range. The labs are tickets, like real life:</p>
<ul>
<li><b>Find the failing interface.</b> Jaipur users cannot reach file server SRV (10.33.3.10) and the R1 to R2 link is slow. Three routers have three different faults: an interface that is disabled, a duplex mismatch, and a wrong IP address.</li>
<li><b>Trace the path.</b> Surat branch cannot reach the ERP server 10.4.4.10 across four routers with static routes. A traceroute shows where packets stop.</li>
<li><b>Watch the neighbour come up.</b> A new link between Indore R1 and hub R2 never forms OSPF. You watch the log live, fix it, and then take a snapshot.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> It is 9 a.m. A user says "the server is slow". A beginner immediately changes configuration. An operator first runs <code>show interfaces terse</code> (is everything up?), then <code>show interfaces ge-0/0/0 extensive</code> (any errors?), then <code>ping 10.33.3.10 count 5</code> (is it reachable and how fast?). In two minutes she knows whether the problem is physical, addressing or routing, and has changed nothing yet. That order, observe before you act, is the habit this module builds.</p></div>

<div class="note"><p><b>Where the simulator differs.</b> Commands such as <code>request system reboot</code> and <code>request system software add</code> are accepted, but the simulated device does not really power off. The text tells you where this matters.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the configuration before reading the facts. Every fix in the labs starts with a show command, and every fix ends with one.</p></div>

<div class="scn"><h4>The "small interface changes"</h4><p>A night-shift engineer in a Jaipur office made "tiny tidy-ups" on three routers. Next morning nothing worked. The day engineer did not touch the config at first. Show interfaces terse on R2 showed one port Admin down, extensive output on R1 and R2 showed a duplex difference, and the show interfaces terse on R3 showed a server-facing address in the wrong subnet. Three faults, three different layers, found in ten minutes because she read before she typed.</p><p><b>Lesson:</b> one symptom can hide several independent faults. Work through the evidence layer by layer.</p></div>

<div class="iv"><p class="q">"A user says the network is slow. What do you do first?"</p><p>Strong answer: do not change anything yet. Check interface state and error counters on the path, test with ping and traceroute to see loss and where traffic stops, read recent logs, and only then form a hypothesis. Mention that you verify after the fix, and that you take a snapshot or rely on commit confirmed/rollback before risky changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations is a loop: observe, test, protect, act, then verify again.</li>
<li>show gives a snapshot; monitor gives a live view; ping and traceroute test reachability.</li>
<li>Take a snapshot before software changes; shut down gracefully, never by pulling power.</li>
<li>Read facts before changing configuration, and verify after every change.</li>
<li>The labs use R1 to R4, ge-0/0/x interfaces, lo0 loopbacks and 10.x addresses.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Jo router pichle mahine configure hua tha uska kaam khatam nahi hua. Use dekhna, test karna, upgrade karna aur kabhi kabhi bachana padta hai. Yeh module JNCIA-Junos exam (JN0-106) ke Operational Monitoring and Maintenance ke roz ke operator skills sikhata hai: interface state aur error counters padhna, logs live follow karna, ping aur traceroute se path test karna, ssh aur telnet se dusre devices tak jaana, pehle snapshot lekar software safely install karna, device ko gracefully shutdown karna, aur khoya hua root password recover karna.</p>
<p><b>Prerequisites.</b> Aapko Junos device mein login karna, operational mode (<code>lab@R1&gt;</code>) aur configuration mode (<code>lab@R1#</code>) ke beech jaana, aur <code>commit</code> use karna aana chahiye. IP address, subnet aur default gateway kya hote hain yeh pata hona chahiye. OSPF gehraai se nahi aana chahiye; labs mein ek chhota OSPF network pehle se bana hai, aur aage ka module jncia-ospf use poori tarah samjhata hai.</p>

<h3>Analogy: hospital ki ward round</h3>
<p>Ek nurse ki ward round socho. Woh har patient ka operation nahi karti. Woh pulse check karti hai (<b>show</b> commands: ek snapshot), chinta wale patient par monitor lagaye rakhti hai (<b>monitor</b> commands: live view), patient se sawaal poochti hai ki jawab deta hai ya nahi (<b>ping</b>), beemar patient ke saath corridor mein chalti hai ki kahan girta hai (<b>traceroute</b>), aur dusre ward ke colleague ko bulati hai (<b>ssh</b>). Koi serious treatment se pehle woh patient record ka backup leti hai (<b>snapshot</b>). Network engineer ka roz ka kaam bhi yahi hai: observe karo, test karo, phir dhyaan se action lo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Operate loop">
<rect x="10" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Observe</text><text x="75" y="75" text-anchor="middle" class="svg-muted" font-size="12">show, monitor</text>
<rect x="170" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="235" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. Test</text><text x="235" y="75" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text>
<rect x="330" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. Protect</text><text x="395" y="75" text-anchor="middle" class="svg-muted" font-size="12">snapshot, commit</text>
<rect x="490" y="30" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Act</text><text x="560" y="75" text-anchor="middle" class="svg-muted" font-size="12">fix, install, reboot</text>
<line x1="140" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="300" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="460" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<path d="M560 90 L560 140 L75 140 L75 90" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="12">show se dobara verify</text>
</svg><p class="cap">Operator loop. Is module ka har chapter in chaar steps mein se ek hai.</p></div>

<h3>Teen labs aur unke peeche ka network</h3>
<p>Aap Junos routers ke chhote networks par practice karoge: R1, R2, R3 (kabhi R4), ek PC1 aur kabhi server SRV. Interfaces ke naam <code>ge-0/0/0</code>, <code>ge-0/0/1</code> waghairah hain aur har router par loopback <code>lo0</code> hai. Addresses 10.x private range se hain. Labs real life ki tarah tickets hain:</p>
<ul>
<li><b>Kharab interface dhoondho.</b> Jaipur ke users file server SRV (10.33.3.10) tak nahi pahunch rahe aur R1 se R2 ka link slow hai. Teen routers par teen alag faults hain: ek disabled interface, ek duplex mismatch, aur ek galat IP address.</li>
<li><b>Rasta trace karo.</b> Surat branch static routes wale chaar routers ke paar ERP server 10.4.4.10 tak nahi pahunch pa rahi. Traceroute dikhata hai packets kahan ruk jaate hain.</li>
<li><b>Neighbour ko up hote dekho.</b> Indore R1 aur hub R2 ke beech naye link par OSPF kabhi nahi banta. Aap log live dekhte ho, fix karte ho, phir snapshot lete ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Subah 9 baje. User kehta hai "server slow hai". Beginner turant configuration badalta hai. Operator pehle <code>show interfaces terse</code> chalata hai (sab up hai?), phir <code>show interfaces ge-0/0/0 extensive</code> (errors hain?), phir <code>ping 10.33.3.10 count 5</code> (reachable hai aur kitna tez?). Do minute mein use pata chal jaata hai ki dikkat physical hai, addressing ki hai ya routing ki, aur abhi tak kuch badla nahi. Yeh order, action se pehle observe, yahi aadat is module mein banti hai.</p></div>

<div class="note"><p><b>Simulator kahan alag hai.</b> <code>request system reboot</code> aur <code>request system software add</code> jaise commands accept hote hain, lekin simulated device sach mein power off nahi hota. Text batata hai kahan yeh matter karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Facts padhne se pehle configuration badal dena. Labs ka har fix show command se shuru hota hai aur show command par hi khatam hota hai.</p></div>

<div class="scn"><h4>"Chhote interface changes"</h4><p>Jaipur office mein night-shift engineer ne teen routers par "chhote tidy-ups" kiye. Agli subah kuch nahi chal raha tha. Day engineer ne pehle config ko haath nahi lagaya. R2 par show interfaces terse mein ek port Admin down mila, R1 aur R2 ke extensive output mein duplex ka fark dikha, aur R3 par show interfaces terse mein server-facing address galat subnet mein tha. Teen faults, teen alag layers, das minute mein mil gaye kyunki usne type karne se pehle padha.</p><p><b>Lesson:</b> ek symptom ke peeche kai independent faults ho sakte hain. Evidence ko layer by layer chalao.</p></div>

<div class="iv"><p class="q">"User kehta hai network slow hai. Sabse pehle kya karoge?"</p><p>Strong answer: abhi kuch badalna nahi. Path ke interfaces ki state aur error counters dekho, ping aur traceroute se loss aur traffic kahan rukta hai test karo, recent logs padho, aur tab hypothesis banao. Batao ki fix ke baad verify karte ho, aur risky change se pehle snapshot ya commit confirmed/rollback use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations ek loop hai: observe, test, protect, act, phir dobara verify.</li>
<li>show snapshot deta hai; monitor live view deta hai; ping aur traceroute reachability test karte hain.</li>
<li>Software change se pehle snapshot lo; gracefully shutdown karo, power kheench kar kabhi nahi.</li>
<li>Configuration badalne se pehle facts padho, aur har change ke baad verify karo.</li>
<li>Labs mein R1 se R4, ge-0/0/x interfaces, lo0 loopbacks aur 10.x addresses hain.</li>
</ul></div>
`}};export{e as default};