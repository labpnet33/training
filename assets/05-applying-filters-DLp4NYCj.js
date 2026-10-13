var e={id:`applying-filters`,h:{en:`Applying filters: input, output, lo0 and verification`,hi:`Filters apply karna: input, output, lo0 aur verification`},body:{en:`
<p>A filter on paper protects nothing. You must attach it to a logical interface, choose a direction, and verify. This chapter explains where filters attach, how direction works, the difference between transit traffic and traffic to the router, and the commands that prove the filter is live.</p>

<h3>Analogy: doors and corridors</h3>
<p>Think of a building with a front door. A guard at the door checks people <b>entering</b> (input) and another checks people <b>leaving</b> (output). A separate guard stands at the door of the manager's private office (the Routing Engine) and checks everyone trying to enter that office, no matter which building door they came through. That office guard is the loopback filter.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Input, output and loopback filter positions">
<rect x="230" y="20" width="180" height="220" rx="10" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<rect x="260" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">lo0.0 input filter</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="11">traffic TO the router</text>
<rect x="260" y="150" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">forwarding</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">traffic THROUGH</text>
<rect x="20" y="150" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="180" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1</text><text x="80" y="198" text-anchor="middle" class="svg-muted" font-size="11">input filter here</text>
<rect x="500" y="150" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2</text><text x="560" y="198" text-anchor="middle" class="svg-muted" font-size="11">output filter here</text>
<line x1="140" y1="185" x2="260" y2="185" stroke="#64748b" stroke-width="2"/><line x1="380" y1="185" x2="500" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="160" x2="260" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
</svg><p class="cap">Interface filters see transit packets; the lo0 filter sees packets addressed to the router.</p></div>

<h3>Where you attach: logical interface, family, direction</h3>
<pre class="code">set interfaces ge-0/0/1 unit 0 family inet filter input LAN-IN
set interfaces ge-0/0/2 unit 0 family inet filter output TO-SERVERS
set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>
<ul>
<li><b>input</b> inspects packets <b>arriving</b> on that unit, before the routing lookup.</li>
<li><b>output</b> inspects packets <b>leaving</b> that unit, after the routing lookup.</li>
<li>You can attach one input and one output filter per family per unit. To use several filters in sequence on one side, use <code>input-list [ FILTER1 FILTER2 ]</code>.</li>
<li>The filter name must exist in the same family. <code>family inet filter</code> refers to a filter under <code>firewall family inet</code>.</li>
</ul>

<h3>Filter on an interface versus filter on lo0</h3>
<table class="cmp"><tr><th></th><th>Interface input/output filter</th><th>lo0.0 input filter</th></tr>
<tr><td>Traffic seen</td><td>Packets arriving at or leaving that one interface, including transit</td><td>Only packets <b>addressed to the router</b> (control plane), from any interface</td></tr>
<tr><td>Typical use</td><td>Block hosts or ports between networks</td><td>Protect SSH, SNMP, routing protocols</td></tr>
<tr><td>Transit traffic</td><td>Filtered</td><td>Not affected at all</td></tr></table>
<p>The lo0 filter is applied to traffic to <b>any</b> address of the router, not only the loopback address. A packet for the router's LAN interface address 10.20.20.1 is still control-plane traffic and passes through the lo0 filter. This fact decides one of the lab questions.</p>
<div class="eg"><p><b>Worked example.</b> A user at 10.20.20.50 pings 10.40.9.10 through the router. This is transit traffic. An input filter on ge-0/0/2 sees it. The lo0 filter does not. The same user then pings the router's own address 10.20.20.1. That packet goes to the Routing Engine, so the lo0 filter sees it and the input filter on ge-0/0/2 sees it first.</p></div>

<h3>Direction and "which way is it going?"</h3>
<p>Always ask: from whose point of view? A packet from a PC to a server is <b>input</b> on the router's PC-facing interface and <b>output</b> on its server-facing interface. Put a filter where it blocks soonest: close to the source, on the <b>input</b> side. Blocking early saves the router the work of forwarding packets it will drop later. Use output filters when you protect one destination network from many incoming paths.</p>

<h3>Verification commands</h3>
<pre class="out">lab@R1&gt; show interfaces ge-0/0/1.0 detail | match Filters
      Input Filters: <span class="hl">LAN-IN</span>

lab@R1&gt; show firewall filter LAN-IN

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
bad-host                                                0                    0

lab@R1&gt; show configuration interfaces ge-0/0/1
unit 0 {
    family inet {
        address 10.40.1.1/24;
        filter {
            input LAN-IN;
        }
    }
}</pre>
<p><code>show interfaces ge-0/0/1.0 detail | match Filters</code> proves the filter is attached. <code>show firewall filter NAME</code> shows its counters. A counter that stays at zero while traffic flows means the traffic does not match the term, or the filter is attached in the wrong direction or on the wrong interface.</p>

<h3>Safe deployment: commit confirmed</h3>
<p>A wrong filter on the interface you are logged in through disconnects you. Use <code>commit confirmed</code>:</p>
<pre class="code">lab@R1# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete
<span class="c">! test from another session, then within 5 minutes:</span>
lab@R1# commit
commit complete</pre>
<p>If you lose access and cannot run the second <code>commit</code>, the router rolls back by itself after five minutes. This is the standard safety net for any filter that can affect management access.</p>

<div class="warn"><p><b>Common mistake.</b> Applying the filter to the wrong direction. A filter meant to block a host from reaching the servers is applied as output on the PC-side interface: it never sees the host's packets, and the counter stays at zero. If a counter is zero, check direction first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lo0 filter affects only traffic destined to the router, not transit traffic. Also remember that input and output are from the router's point of view, per interface unit and family.</p></div>

<div class="scn"><h4>The filter that guarded the wrong door</h4><p>An engineer was asked to block social media sites from the guest Wi-Fi. He wrote the filter and applied it as output on the router's interface towards the internet. The block seemed to work for the first test, but a guest could still reach the sites over VPN and from a second uplink. The real problem was positioning: output on one uplink protects only that uplink. Moving the filter to input on the guest-facing interface covered all paths, saved forwarding work, and gave a single counter to report on.</p><p><b>Lesson:</b> filter as close to the source as you can, on input.</p></div>

<div class="iv"><p class="q">"Where do you apply a filter that must protect the router itself, and what does it not affect?"</p><p>Strong answer: as an input filter on lo0.0. It sees all traffic destined to any address of the router, whichever interface it came in on, so one filter protects SSH, SNMP and routing protocols. It does not touch transit traffic. I would apply it with commit confirmed, test from a permitted and a denied source, and verify counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attach under interfaces unit family inet filter input or output.</li>
<li>input sees arriving packets; output sees leaving packets; filter close to the source.</li>
<li>The lo0.0 filter sees only traffic to the router, to any of its addresses.</li>
<li>Prove with show interfaces detail (Input Filters line), show firewall filter and show configuration.</li>
<li>Use commit confirmed so a mistake rolls back automatically.</li>
</ul></div>
`,hi:`
<p>Kaagaz par likha filter kuch nahi bachata. Aapko use logical interface par attach karna hai, direction chunni hai, aur verify karna hai. Yeh chapter samjhata hai ki filters kahan attach hote hain, direction kaise kaam karti hai, transit traffic aur router ko hi jaane wale traffic mein farak, aur woh commands jo prove karte hain ki filter live hai.</p>

<h3>Analogy: darwaze aur corridors</h3>
<p>Front door wali building sochiye. Door par ek guard <b>aane</b> wale (input) logon ko check karta hai aur doosra <b>jaane</b> wale (output) ko. Ek alag guard manager ke private office (Routing Engine) ke darwaze par khada hai aur office mein jaane ki koshish karne wale har insaan ko check karta hai, chahe woh building ke kisi bhi darwaze se aaya ho. Woh office guard loopback filter hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Input, output and loopback filter positions">
<rect x="230" y="20" width="180" height="220" rx="10" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<rect x="260" y="60" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">lo0.0 input filter</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="11">router TAK traffic</text>
<rect x="260" y="150" width="120" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">forwarding</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">router SE guzarta</text>
<rect x="20" y="150" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="180" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1</text><text x="80" y="198" text-anchor="middle" class="svg-muted" font-size="11">input filter yahan</text>
<rect x="500" y="150" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2</text><text x="560" y="198" text-anchor="middle" class="svg-muted" font-size="11">output filter yahan</text>
<line x1="140" y1="185" x2="260" y2="185" stroke="#64748b" stroke-width="2"/><line x1="380" y1="185" x2="500" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="140" y1="160" x2="260" y2="90" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
</svg><p class="cap">Interface filters transit packets dekhte hain; lo0 filter router ko address kiye packets dekhta hai.</p></div>

<h3>Kahan attach karte hain: logical interface, family, direction</h3>
<pre class="code">set interfaces ge-0/0/1 unit 0 family inet filter input LAN-IN
set interfaces ge-0/0/2 unit 0 family inet filter output TO-SERVERS
set interfaces lo0 unit 0 family inet filter input PROTECT-RE</pre>
<ul>
<li><b>input</b> us unit par <b>aane</b> wale packets inspect karta hai, routing lookup se pehle.</li>
<li><b>output</b> us unit se <b>jaane</b> wale packets inspect karta hai, routing lookup ke baad.</li>
<li>Ek family ke liye ek unit par ek input aur ek output filter lag sakta hai. Ek side par kai filters sequence mein chalane ke liye <code>input-list [ FILTER1 FILTER2 ]</code> use karo.</li>
<li>Filter ka naam usi family mein hona chahiye. <code>family inet filter</code> <code>firewall family inet</code> ke neeche ke filter ko refer karta hai.</li>
</ul>

<h3>Interface par filter versus lo0 par filter</h3>
<table class="cmp"><tr><th></th><th>Interface input/output filter</th><th>lo0.0 input filter</th></tr>
<tr><td>Kaunsa traffic dekhta hai</td><td>Us ek interface par aane ya jaane wale packets, transit bhi</td><td>Sirf <b>router ko address kiye</b> packets (control plane), kisi bhi interface se</td></tr>
<tr><td>Typical use</td><td>Networks ke beech hosts ya ports block karna</td><td>SSH, SNMP, routing protocols bachana</td></tr>
<tr><td>Transit traffic</td><td>Filter hota hai</td><td>Bilkul asar nahi</td></tr></table>
<p>lo0 filter router ke <b>kisi bhi</b> address ke traffic par lagta hai, sirf loopback address par nahi. Router ke LAN interface address 10.20.20.1 ko jaane wala packet bhi control-plane traffic hai aur lo0 filter se guzarta hai. Yeh fact lab ke ek sawal ko decide karta hai.</p>
<div class="eg"><p><b>Worked example.</b> 10.20.20.50 ka user router ke through 10.40.9.10 ko ping karta hai. Yeh transit traffic hai. ge-0/0/2 ka input filter use dekhta hai. lo0 filter nahi dekhta. Wahi user ab router ke apne address 10.20.20.1 ko ping karta hai. Woh packet Routing Engine ko jaata hai, isliye lo0 filter use dekhta hai, aur ge-0/0/2 ka input filter use pehle dekhta hai.</p></div>

<h3>Direction aur "yeh kis taraf ja raha hai?"</h3>
<p>Hamesha poochho: kiske point of view se? PC se server ka packet router ke PC-facing interface par <b>input</b> hai aur server-facing interface par <b>output</b>. Filter wahan lagao jahan woh sabse jaldi block kare: source ke paas, <b>input</b> side par. Jaldi block karne se router ko aise packets forward karne ka kaam nahi karna padta jo baad mein drop honge. Output filters tab use karo jab ek destination network ko kai incoming paths se bachana ho.</p>

<h3>Verification commands</h3>
<pre class="out">lab@R1&gt; show interfaces ge-0/0/1.0 detail | match Filters
      Input Filters: <span class="hl">LAN-IN</span>

lab@R1&gt; show firewall filter LAN-IN

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
bad-host                                                0                    0

lab@R1&gt; show configuration interfaces ge-0/0/1
unit 0 {
    family inet {
        address 10.40.1.1/24;
        filter {
            input LAN-IN;
        }
    }
}</pre>
<p><code>show interfaces ge-0/0/1.0 detail | match Filters</code> prove karta hai ki filter attached hai. <code>show firewall filter NAME</code> uske counters dikhata hai. Jo counter traffic chalte hue bhi zero rahe, uska matlab traffic term se match nahi kar raha, ya filter galat direction mein ya galat interface par attached hai.</p>

<h3>Safe deployment: commit confirmed</h3>
<p>Jis interface se aap logged in ho us par galat filter aapko disconnect kar deta hai. <code>commit confirmed</code> use karo:</p>
<pre class="code">lab@R1# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete
<span class="c">! doosre session se test karo, phir 5 minute ke andar:</span>
lab@R1# commit
commit complete</pre>
<p>Agar access chala jaaye aur aap doosra <code>commit</code> na chala sako, to router paanch minute baad khud rollback ho jaata hai. Management access ko affect kar sakne wale har filter ke liye yeh standard safety net hai.</p>

<div class="warn"><p><b>Common mistake.</b> Filter galat direction mein lagana. Host ko servers tak pahunchne se rokne wala filter PC-side interface par output ke roop mein lagaya: woh host ke packets dekhta hi nahi, aur counter zero rehta hai. Counter zero ho to pehle direction check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> lo0 filter sirf router ko jaane wale traffic par asar karta hai, transit traffic par nahi. Yeh bhi yaad rakho ki input aur output router ke point of view se hain, interface unit aur family ke hisaab se.</p></div>

<div class="scn"><h4>Filter jo galat darwaze par khada tha</h4><p>Ek engineer se guest Wi-Fi se social media sites block karne ko kaha gaya. Usne filter likha aur router ke internet wale interface par output ke roop mein lagaya. Pehle test mein block chalta dikha, lekin guest VPN aur doosre uplink se ab bhi sites tak pahunch sakta tha. Asli problem positioning thi: ek uplink par output sirf wahi uplink bachata hai. Filter ko guest-facing interface par input par le jaane se saare paths cover hue, forwarding ka kaam bacha, aur report karne ke liye ek hi counter mila.</p><p><b>Lesson:</b> filter ko source ke jitna ho sake paas, input par lagao.</p></div>

<div class="iv"><p class="q">"Router ko khud bachane wala filter kahan lagate ho, aur woh kis par asar nahi karta?"</p><p>Strong answer: lo0.0 par input filter ke roop mein. Woh router ke kisi bhi address ko jaane wale saare traffic ko dekhta hai, chahe kisi bhi interface se aaye, isliye ek filter SSH, SNMP aur routing protocols bachata hai. Woh transit traffic ko nahi chhoota. Main use commit confirmed se apply karunga, ek permitted aur ek denied source se test karunga, aur counters verify karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>interfaces unit family inet filter input ya output ke neeche attach karo.</li>
<li>input aane wale packets dekhta hai; output jaane wale; filter source ke paas lagao.</li>
<li>lo0.0 filter sirf router ko jaane wala traffic dekhta hai, uske kisi bhi address par.</li>
<li>show interfaces detail (Input Filters line), show firewall filter aur show configuration se prove karo.</li>
<li>commit confirmed use karo taaki galti apne aap rollback ho.</li>
</ul></div>
`}};export{e as default};