var e={id:`big-picture`,h:{en:`What an ACL is and where it is used`,hi:`ACL kya hai aur kahan use hota hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read any access control list (ACL) the way a router reads it, write wildcard masks for hosts, subnets, ranges and odd patterns without hesitation, build standard, extended and named ACLs, place each type in the right spot, apply them in the right direction on interfaces and on the VTY lines, edit a live list with sequence numbers, prove what a list is doing with hit counters and logs, write IPv6 ACLs without breaking neighbour discovery, and troubleshoot the classic tickets such as "the ACL killed OSPF" or "guests can still reach HR". This covers the CCNA 200-301 exam topic <b>configure and verify access control lists</b> in the Security Fundamentals domain.</p>
<p><b>Prerequisites.</b> You need IPv4 subnetting and masks (ccna-ipv4), IPv6 prefixes (ccna-ipv6), static routing and single-area OSPF (ccna-static, ccna-ospf), and basic TCP and UDP port numbers (ccna-models). You met ACLs briefly in the NAT module, where a standard ACL chose which inside addresses get translated. Here we go deep.</p>

<h3>Start with an analogy: the society gate guard</h3>
<p>Picture the security guard at the gate of a housing society. He holds a clipboard with numbered rules: "1. Delivery staff: allow to the lobby only. 2. Car number MH-01-AB-1234: deny, unpaid dues. 3. Residents: allow." When someone arrives, he reads the rules <b>from the top</b> and acts on the <b>first rule that fits</b>. He never reads further once a rule matches. And if a visitor matches no rule at all, the society policy is simple: <b>not on the list, not allowed in</b>.</p>
<p>A router interface with an ACL behaves exactly like that guard. The clipboard is the ACL, each rule is an <b>access control entry</b> (ACE), and the packet is the visitor. The guard has no memory of who went out earlier; he judges every person fresh. Routers with plain ACLs are the same: they are <b>stateless</b>.</p>

<h3>What an ACL actually is</h3>
<dl class="terms">
<dt>Access control list (ACL)</dt><dd>An ordered list of <b>permit</b> and <b>deny</b> statements that classify packets by fields in their headers: source address, destination address, protocol, and TCP or UDP ports.</dd>
<dt>Access control entry (ACE)</dt><dd>One line of the list, for example <code>deny 10.1.20.0 0.0.0.255</code>. Each ACE has a sequence number.</dd>
<dt>Wildcard mask</dt><dd>The mask that tells the ACE which address bits must match (0) and which do not matter (1). Chapters 3 and 4 drill it.</dd>
<dt>Implicit deny</dt><dd>An invisible last line, <code>deny any</code>, at the end of every IPv4 ACL. Chapter 2 explains why it causes most ACL tickets.</dd>
</dl>
<p>On its own an ACL is only a <b>definition</b>. It does nothing until some feature <b>references</b> it. That is the key idea of this chapter: the same list can be a filter, a NAT selector or a QoS classifier, depending on who calls it.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="One ACL, many jobs">
<rect x="240" y="95" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">ACL</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">permit / deny list</text>
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">Interface filter</text>
<rect x="20" y="186" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="213" text-anchor="middle" class="svg-ink" font-size="13">NAT selector</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">QoS class-map</text>
<rect x="450" y="103" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="13">Route filter</text>
<rect x="450" y="186" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="213" text-anchor="middle" class="svg-ink" font-size="13">VTY access-class</text>
<line x1="190" y1="42" x2="240" y2="110" stroke="#64748b" stroke-width="2"/><line x1="190" y1="208" x2="240" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="110" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="400" y1="125" x2="450" y2="125" stroke="#64748b" stroke-width="2"/><line x1="400" y1="140" x2="450" y2="208" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One list, many callers. The feature that references the ACL decides what permit and deny mean.</p></div>

<h3>Where ACLs are used</h3>
<table class="cmp">
<tr><th>Use</th><th>What permit means</th><th>How it is referenced</th></tr>
<tr><td>Packet filtering on an interface</td><td>Forward the packet</td><td><code>ip access-group 110 in</code></td></tr>
<tr><td>NAT and PAT</td><td>Translate this source</td><td><code>ip nat inside source list 1 interface g0/1 overload</code></td></tr>
<tr><td>QoS classification</td><td>Put the packet in this class</td><td><code>match access-group name VOICE</code> in a class-map</td></tr>
<tr><td>Route filtering</td><td>Accept or advertise this prefix</td><td><code>distribute-list 20 in</code> under a routing process</td></tr>
<tr><td>Management access</td><td>Allow this source to log in</td><td><code>access-class 15 in</code> under <code>line vty 0 4</code></td></tr>
<tr><td>Troubleshooting</td><td>Show only these packets</td><td><code>debug ip packet 101</code></td></tr>
</table>
<p>Notice that in NAT, QoS and route filtering a <b>deny does not drop anything</b>. It only means "not selected". A packet denied by a NAT ACL is simply sent without translation. Only the interface filter and the VTY access-class actually block traffic.</p>

<h3>Why it matters</h3>
<p>Routers forward everything they have a route for. Without ACLs, a guest on the Wi-Fi can reach the payroll server as easily as the payroll team. ACLs are the simplest way to express policy such as "guests get the internet but not HR" or "the training lab may browse the web server and nothing else". They are not a full firewall, because they do not track sessions, but they are everywhere: on branch routers, on Layer 3 switches, protecting management access, and feeding NAT and QoS.</p>

<div class="eg"><p><b>Worked example: from a sentence to lines.</b> Policy: "The guest subnet 10.1.20.0/24 must never reach the HR LAN 10.2.50.0/24; everyone else keeps full access." Step 1: who is matched? The guest subnet, so the ACE is <code>deny 10.1.20.0 0.0.0.255</code>. Step 2: what about everyone else? Without a permit the implicit deny would block them, so add <code>permit any</code>. Step 3: where does it go? Near HR, outbound toward the HR LAN. This is exactly the first lab of this module, and chapter 5 builds it step by step.</p></div>

<pre class="code"><span class="c">! A first taste: standard ACL 10 on R2 (lab acl-standard)</span>
R2(config)# access-list 10 remark Block guest Wi-Fi from HR
R2(config)# access-list 10 deny 10.1.20.0 0.0.0.255
R2(config)# access-list 10 permit any
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out</pre>
<pre class="out">R2# show access-lists
Standard IP access list 10
    10 deny   10.1.20.0, wildcard bits 0.0.0.255 <span class="hl">(8 matches)</span>
    20 permit any <span class="hl">(15 matches)</span></pre>
<p>The match counters are your proof that real traffic hit each line. You will lean on them in every lab.</p>

<div class="warn"><p><b>Common mistake.</b> Creating the ACL and forgetting to apply it. <code>show access-lists</code> shows the list with no matches, and people conclude "the ACL is wrong". Always check <code>show ip interface</code> to see whether any interface actually uses it.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question may show an ACL used by NAT and ask whether denied hosts lose connectivity. They do not; they are just not translated. "Deny" only drops traffic when the ACL filters an interface or VTY lines.</p></div>

<div class="scn"><h4>The ACL that did nothing for a month</h4><p>An auditor at a branch office found that contractors could reach the finance server. The router config clearly contained <code>ip access-list extended FIN-PROTECT</code> with the correct deny line. The engineer ran <code>show ip interface g0/1</code> and saw "Inbound access list is not set". During a hardware swap a month earlier, the interface config had been pasted but the <code>ip access-group</code> line had been missed. The counters in <code>show access-lists</code> were all zero, which was the clue.</p><p><b>Lesson:</b> an ACL is a definition until something references it. Zero counters on an ACL you expect to be busy means "check where it is applied".</p></div>

<div class="iv"><p class="q">"What is an ACL, and name some places it is used besides filtering."</p><p>Strong answer: an ACL is an ordered list of permit and deny entries matched top-down with first-match logic and an implicit deny at the end. Besides interface filtering, it selects traffic for NAT, classifies traffic for QoS, filters routes with distribute-lists, restricts VTY access with access-class and limits debug output. Add that in those other uses deny means "not selected", not "drop".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An ACL is an ordered list of permit and deny entries (ACEs) that classify packets by header fields.</li>
<li>It does nothing until a feature references it: interface, NAT, QoS, routing, VTY or debug.</li>
<li>Only interface filters and VTY access-class drop traffic; elsewhere deny means "not selected".</li>
<li>Plain ACLs are stateless: every packet is judged on its own.</li>
<li>Match counters in <code>show access-lists</code> prove which lines real traffic hits.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap koi bhi access control list (ACL) waise padh paoge jaise router padhta hai, hosts, subnets, ranges aur odd patterns ke liye wildcard masks bina atke likh paoge, standard, extended aur named ACLs bana paoge, har type ko sahi jagah laga paoge, unhe interfaces aur VTY lines par sahi direction mein apply kar paoge, live list ko sequence numbers se edit kar paoge, hit counters aur logs se prove kar paoge ki list kya kar rahi hai, neighbour discovery tode bina IPv6 ACLs likh paoge, aur classic tickets troubleshoot kar paoge jaise "ACL ne OSPF maar diya" ya "guests ab bhi HR tak pahunch rahe hain". Yeh CCNA 200-301 ke Security Fundamentals domain ka exam topic <b>configure and verify access control lists</b> cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko IPv4 subnetting aur masks (ccna-ipv4), IPv6 prefixes (ccna-ipv6), static routing aur single-area OSPF (ccna-static, ccna-ospf), aur basic TCP aur UDP port numbers (ccna-models) aane chahiye. NAT module mein aap ACLs se thoda mil chuke ho, jahan ek standard ACL ne chuna tha ki kaunse inside addresses translate honge. Yahan hum gehrai mein jaayenge.</p>

<h3>Ek analogy se shuru karo: society gate ka guard</h3>
<p>Ek housing society ke gate par security guard ko socho. Uske paas numbered rules wala clipboard hai: "1. Delivery staff: sirf lobby tak allow. 2. Car number MH-01-AB-1234: deny, dues baaki hain. 3. Residents: allow." Jab koi aata hai, woh rules <b>upar se</b> padhta hai aur <b>pehle fit hone wale rule</b> par action leta hai. Rule match hone ke baad woh aage nahi padhta. Aur agar visitor kisi rule se match hi na kare, to society ki policy simple hai: <b>list mein nahi, to andar nahi</b>.</p>
<p>ACL wala router interface bilkul us guard jaisa behave karta hai. Clipboard ACL hai, har rule ek <b>access control entry</b> (ACE) hai, aur packet visitor hai. Guard ko yaad nahi rehta ki pehle kaun bahar gaya tha; woh har insaan ko naye sire se judge karta hai. Plain ACLs wale routers bhi aise hi hain: woh <b>stateless</b> hain.</p>

<h3>ACL asal mein kya hai</h3>
<dl class="terms">
<dt>Access control list (ACL)</dt><dd><b>permit</b> aur <b>deny</b> statements ki ordered list jo packets ko unke headers ke fields se classify karti hai: source address, destination address, protocol, aur TCP ya UDP ports.</dd>
<dt>Access control entry (ACE)</dt><dd>List ki ek line, jaise <code>deny 10.1.20.0 0.0.0.255</code>. Har ACE ka ek sequence number hota hai.</dd>
<dt>Wildcard mask</dt><dd>Woh mask jo ACE ko batata hai ki address ke kaunse bits match hone chahiye (0) aur kaunse matter nahi karte (1). Chapters 3 aur 4 iski practice karwate hain.</dd>
<dt>Implicit deny</dt><dd>Har IPv4 ACL ke end mein ek invisible aakhri line, <code>deny any</code>. Chapter 2 samjhata hai ki zyada tar ACL tickets isi se kyun aate hain.</dd>
</dl>
<p>Akela ACL sirf ek <b>definition</b> hai. Woh tab tak kuch nahi karta jab tak koi feature use <b>reference</b> na kare. Is chapter ka yahi key idea hai: same list filter, NAT selector ya QoS classifier ho sakti hai, is par depend karta hai ki use kaun call kar raha hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ek ACL, kai kaam">
<rect x="240" y="95" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">ACL</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">permit / deny list</text>
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">Interface filter</text>
<rect x="20" y="186" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="213" text-anchor="middle" class="svg-ink" font-size="13">NAT selector</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">QoS class-map</text>
<rect x="450" y="103" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="13">Route filter</text>
<rect x="450" y="186" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="213" text-anchor="middle" class="svg-ink" font-size="13">VTY access-class</text>
<line x1="190" y1="42" x2="240" y2="110" stroke="#64748b" stroke-width="2"/><line x1="190" y1="208" x2="240" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="110" x2="450" y2="42" stroke="#64748b" stroke-width="2"/><line x1="400" y1="125" x2="450" y2="125" stroke="#64748b" stroke-width="2"/><line x1="400" y1="140" x2="450" y2="208" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek list, kai callers. Jo feature ACL ko reference karta hai, wahi decide karta hai ki permit aur deny ka matlab kya hai.</p></div>

<h3>ACLs kahan use hote hain</h3>
<table class="cmp">
<tr><th>Use</th><th>Permit ka matlab</th><th>Kaise reference hota hai</th></tr>
<tr><td>Interface par packet filtering</td><td>Packet forward karo</td><td><code>ip access-group 110 in</code></td></tr>
<tr><td>NAT aur PAT</td><td>Is source ko translate karo</td><td><code>ip nat inside source list 1 interface g0/1 overload</code></td></tr>
<tr><td>QoS classification</td><td>Packet ko is class mein daalo</td><td>class-map mein <code>match access-group name VOICE</code></td></tr>
<tr><td>Route filtering</td><td>Is prefix ko accept ya advertise karo</td><td>Routing process ke neeche <code>distribute-list 20 in</code></td></tr>
<tr><td>Management access</td><td>Is source ko login karne do</td><td><code>line vty 0 4</code> ke neeche <code>access-class 15 in</code></td></tr>
<tr><td>Troubleshooting</td><td>Sirf yeh packets dikhao</td><td><code>debug ip packet 101</code></td></tr>
</table>
<p>Dhyan do ki NAT, QoS aur route filtering mein <b>deny kuch drop nahi karta</b>. Iska matlab sirf "select nahi hua" hai. NAT ACL se deny hua packet bas bina translation ke bhej diya jaata hai. Sirf interface filter aur VTY access-class hi asal mein traffic block karte hain.</p>

<h3>Yeh kyun zaroori hai</h3>
<p>Routers har us cheez ko forward karte hain jiske liye unke paas route hai. ACLs ke bina, Wi-Fi par baitha guest payroll server tak utni hi aasani se pahunch sakta hai jitna payroll team. ACLs policy express karne ka sabse simple tareeka hain, jaise "guests ko internet milega par HR nahi" ya "training lab sirf web server browse kar sakta hai, aur kuch nahi". Yeh full firewall nahi hain, kyunki sessions track nahi karte, par yeh har jagah hain: branch routers par, Layer 3 switches par, management access bachane mein, aur NAT aur QoS ko feed karne mein.</p>

<div class="eg"><p><b>Worked example: sentence se lines tak.</b> Policy: "Guest subnet 10.1.20.0/24 kabhi HR LAN 10.2.50.0/24 tak nahi pahunchna chahiye; baaki sabka full access rahega." Step 1: kise match karna hai? Guest subnet ko, isliye ACE hai <code>deny 10.1.20.0 0.0.0.255</code>. Step 2: baaki sab ka kya? Permit ke bina implicit deny unhe block kar dega, isliye <code>permit any</code> jodo. Step 3: yeh kahan jaayega? HR ke paas, HR LAN ki taraf outbound. Yahi is module ka pehla lab hai, aur chapter 5 ise step by step banata hai.</p></div>

<pre class="code"><span class="c">! Pehla swaad: R2 par standard ACL 10 (lab acl-standard)</span>
R2(config)# access-list 10 remark Block guest Wi-Fi from HR
R2(config)# access-list 10 deny 10.1.20.0 0.0.0.255
R2(config)# access-list 10 permit any
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip access-group 10 out</pre>
<pre class="out">R2# show access-lists
Standard IP access list 10
    10 deny   10.1.20.0, wildcard bits 0.0.0.255 <span class="hl">(8 matches)</span>
    20 permit any <span class="hl">(15 matches)</span></pre>
<p>Match counters is baat ka saboot hain ki real traffic ne har line ko hit kiya. Har lab mein aap inpar bharosa karoge.</p>

<div class="warn"><p><b>Common galti.</b> ACL banana aur use apply karna bhool jaana. <code>show access-lists</code> list ko bina matches ke dikhata hai, aur log maan lete hain ki "ACL galat hai". Hamesha <code>show ip interface</code> check karo ki koi interface asal mein use use kar raha hai ya nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question NAT dwara use ho rahe ACL ko dikha kar pooch sakta hai ki kya denied hosts ki connectivity chali jaayegi. Nahi jaati; bas unka translation nahi hota. "Deny" traffic tabhi drop karta hai jab ACL kisi interface ya VTY lines ko filter kar raha ho.</p></div>

<div class="scn"><h4>Woh ACL jo ek mahine tak kuch nahi kar raha tha</h4><p>Ek branch office ke auditor ne paaya ki contractors finance server tak pahunch sakte the. Router config mein saaf taur par <code>ip access-list extended FIN-PROTECT</code> sahi deny line ke saath maujood tha. Engineer ne <code>show ip interface g0/1</code> chalaya aur dekha "Inbound access list is not set". Ek mahine pehle hardware swap ke dauran interface config paste hua tha par <code>ip access-group</code> wali line chhoot gayi thi. <code>show access-lists</code> mein saare counters zero the, yahi clue tha.</p><p><b>Seekh:</b> ACL tab tak sirf definition hai jab tak koi use reference na kare. Jis ACL ko busy hona chahiye uske counters zero hon, to matlab hai "check karo woh kahan apply hai".</p></div>

<div class="iv"><p class="q">"ACL kya hai, aur filtering ke alawa kuch jagah batao jahan yeh use hota hai."</p><p>Strong answer: ACL permit aur deny entries ki ordered list hai jo top-down first-match logic se match hoti hai aur end mein implicit deny hota hai. Interface filtering ke alawa yeh NAT ke liye traffic select karta hai, QoS ke liye traffic classify karta hai, distribute-lists se routes filter karta hai, access-class se VTY access restrict karta hai aur debug output limit karta hai. Jodo ki in doosre uses mein deny ka matlab "select nahi hua" hai, "drop" nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACL permit aur deny entries (ACEs) ki ordered list hai jo packets ko header fields se classify karti hai.</li>
<li>Jab tak koi feature use reference na kare, yeh kuch nahi karta: interface, NAT, QoS, routing, VTY ya debug.</li>
<li>Sirf interface filters aur VTY access-class traffic drop karte hain; baaki jagah deny ka matlab "select nahi hua" hai.</li>
<li>Plain ACLs stateless hain: har packet ko akele judge kiya jaata hai.</li>
<li><code>show access-lists</code> ke match counters prove karte hain ki real traffic kaunsi lines hit kar raha hai.</li>
</ul></div>
`}};export{e as default};