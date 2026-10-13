var e={id:`build-hub-spokes`,h:{en:`Building the hub and spokes`,hi:`Hub aur spokes banana`},body:{en:`
<p>Opening a new branch of the courier company takes three phone numbers on a card: the head office's address, the head office's switchboard, and "send the daily bulletin to head office". A DMVPN spoke needs exactly the same three facts about the hub. The hub needs to know none of the branches in advance. This chapter builds the cloud from lab 1 ("Build a DMVPN phase 2 network with OSPF"), tasks 1 and 2.</p>

<h3>Step 1: the hub (NHS)</h3>
<pre class="code"><span class="c">! HUB (Delhi DC)</span>
interface Tunnel0
 description DMVPN hub
 ip address 172.16.100.1 255.255.255.0
 no ip redirects
 ip nhrp authentication NKdmvpn
 ip nhrp network-id 100
<span class="c">! copy multicast (IGP hellos) to every spoke that registers</span>
 ip nhrp map multicast dynamic
 ip nhrp holdtime 300
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint</pre>
<p>Notice what is missing: no <code>tunnel destination</code>, no <code>ip nhrp nhs</code>, no spoke addresses at all. The hub learns every spoke from its registration.</p>

<h3>Step 2: the spokes (NHC)</h3>
<pre class="code"><span class="c">! SPOKE1 (Pune). On SPOKE2 only the IP changes to 172.16.100.3</span>
interface Tunnel0
 description DMVPN spoke
 ip address 172.16.100.2 255.255.255.0
 no ip redirects
 ip nhrp authentication NKdmvpn
 ip nhrp network-id 100
<span class="c">! 1. where the hub lives in the underlay</span>
 ip nhrp map 172.16.100.1 100.64.10.2
<span class="c">! 2. send multicast (hellos) to the hub</span>
 ip nhrp map multicast 100.64.10.2
<span class="c">! 3. register with this server</span>
 ip nhrp nhs 172.16.100.1
 ip nhrp holdtime 300
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint</pre>
<p>Newer IOS and IOS XE releases accept one line that replaces the three NHRP lines: <code>ip nhrp nhs 172.16.100.1 nbma 100.64.10.2 multicast</code>. Both forms appear in exam questions, so be able to read either.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="What each NHRP line on a spoke does">
<defs><marker id="b4e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="70" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">SPOKE1</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">172.16.100.2</text>
<rect x="470" y="70" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">.1 = 100.64.10.2</text>
<line x1="170" y1="80" x2="466" y2="80" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4e)"/><text x="318" y="72" text-anchor="middle" class="svg-ink" font-size="12">map .1 to 100.64.10.2 (how to reach)</text>
<line x1="170" y1="105" x2="466" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4e)"/><text x="318" y="98" text-anchor="middle" class="svg-ink" font-size="12">nhs .1 (register here)</text>
<line x1="170" y1="130" x2="466" y2="130" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4e)"/><text x="318" y="123" text-anchor="middle" class="svg-ink" font-size="12">map multicast (hellos to hub)</text>
<line x1="466" y1="165" x2="174" y2="165" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#b4e)"/><text x="318" y="185" text-anchor="middle" class="svg-accent" font-size="12">hub: map multicast dynamic (hellos to every registered spoke)</text>
</svg><p class="cap">Three spoke lines point at the hub; one hub line points back at whoever registered.</p></div>

<h3>Verification: is the spoke registered?</h3>
<p>Always check from both sides. On the spoke, the NHS must be <b>RE</b> (responding). On the hub, every spoke must appear as a dynamic peer.</p>
<pre class="out">SPOKE1# show ip nhrp nhs detail
Legend: E=Expecting replies, R=Responding, W=Waiting, D=Dynamic
Tunnel0:
<span class="hl">172.16.100.1  RE NBMA Address: 100.64.10.2 priority = 0 cluster = 0  req-sent 9  req-failed 0  repl-recv 9 (00:00:38 ago)</span></pre>
<pre class="out">HUB# show dmvpn
Legend: Attrb --&gt; S - Static, D - Dynamic, I - Incomplete
        T1 - Route Installed, T2 - Nexthop-override
        NHS Status: E --&gt; Expecting Replies, R --&gt; Responding, W --&gt; Waiting
==========================================================================
Interface: Tunnel0, IPv4 NHRP Details
<span class="hl">Type:Hub, NHRP Peers:2,</span>

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
<span class="hl">     1 100.64.20.2        172.16.100.2    UP 00:12:40     D</span>
<span class="hl">     1 100.64.30.2        172.16.100.3    UP 00:12:31     D</span></pre>
<pre class="out">SPOKE1# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:1,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
<span class="hl">     1 100.64.10.2        172.16.100.1    UP 00:12:40     S</span></pre>
<p>How to read <code>show dmvpn</code>: one line per NBMA peer. <b>State UP</b> means NHRP is working with that peer; <b>NHRP</b> in the State column means a mapping exists but registration has not succeeded; <b>IKE</b> or <b>IPSEC</b> there means the crypto part is still negotiating. <b>Attrb S</b> is a static mapping (the hub on a spoke), <b>D</b> is dynamic (learned by registration or resolution). <code>show dmvpn detail</code> adds the crypto sessions per peer.</p>

<div class="eg"><p><b>Worked example.</b> Add a third branch, Jaipur, with NBMA 100.64.40.2. Its Tunnel0 is a copy of SPOKE1's with <code>ip address 172.16.100.4 255.255.255.0</code>. Nothing changes on the hub. About a second after the tunnel comes up, the hub shows "NHRP Peers:3" and a third D line for 100.64.40.2 / 172.16.100.4. With a 300 s holdtime, the spoke refreshes every 100 s, so <code>req-sent</code> on Jaipur grows by about 36 per hour.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Pointing <code>ip nhrp nhs</code> at the hub's <b>public</b> address instead of its tunnel address. (2) A typo in the NHS address, such as 172.16.100.11: the spoke keeps sending requests to an address nobody owns and the NHS stays <b>E</b>. (3) Mapping the hub tunnel IP to the wrong NBMA address. (4) Different authentication strings. All four look the same: the NHS never reaches RE and the hub has no entry.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>show ip nhrp nhs</code>, <b>E</b> alone means "expecting replies": requests are going out but nothing comes back. <b>RE</b> means responding and expected. And <code>show dmvpn</code> on the hub shows <b>D</b> for spokes, never S, because the hub has no static maps for them.</p></div>

<div class="scn"><h4>Copy-paste spoke that never registered</h4><p>A new branch router came up with the DMVPN template, the tunnel was up/up, but the hub did not list it. <code>show ip nhrp nhs detail</code> showed the NHS in state E with req-sent climbing and repl-recv 0. Comparing with a working spoke revealed <code>ip nhrp nhs 100.64.10.2</code>: the installer had typed the hub's public address. Replacing it with <code>ip nhrp nhs 172.16.100.1</code> brought the NHS to RE within seconds.</p><p><b>Lesson:</b> NHS = tunnel address; static map = tunnel address to NBMA address. Check <code>show ip nhrp nhs detail</code> first.</p></div>

<div class="iv"><p class="q">"What is the minimum configuration a DMVPN spoke needs, and why does the hub need none per spoke?"</p><p>Strong answer: an mGRE tunnel with source and IP, NHRP network-id and matching authentication, a static NHRP mapping of the hub tunnel IP to its NBMA address, multicast mapping to the hub, and the hub as NHS. The hub only needs mGRE, NHRP and <code>map multicast dynamic</code>, because each spoke registers its own mapping. Mention the one-line <code>ip nhrp nhs ... nbma ... multicast</code> form and verification with <code>show ip nhrp nhs</code> and <code>show dmvpn</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub: mGRE + network-id + authentication + <code>map multicast dynamic</code> + holdtime. No per-spoke lines.</li>
<li>Spoke: static map to the hub NBMA, multicast to the hub, NHS = hub tunnel IP.</li>
<li><code>ip nhrp nhs 172.16.100.1 nbma 100.64.10.2 multicast</code> is the modern one-liner.</li>
<li>Verify with <code>show ip nhrp nhs detail</code> (RE) on the spoke and <code>show dmvpn</code> (D entries) on the hub.</li>
<li>State UP = working; NHRP = mapped but not registered; Attrb S = static, D = dynamic.</li>
</ul></div>
`,hi:`
<p>Courier company ki nayi branch kholne ke liye ek card par teen phone numbers chahiye: head office ka address, head office ka switchboard, aur "daily bulletin head office ko bhejo". DMVPN spoke ko hub ke baare mein bilkul yahi teen facts chahiye. Hub ko pehle se koi branch jaanni nahi padti. Yeh chapter lab 1 ("OSPF ke saath DMVPN phase 2 network banao") ke tasks 1 aur 2 se cloud banata hai.</p>

<h3>Step 1: hub (NHS)</h3>
<pre class="code"><span class="c">! HUB (Delhi DC)</span>
interface Tunnel0
 description DMVPN hub
 ip address 172.16.100.1 255.255.255.0
 no ip redirects
 ip nhrp authentication NKdmvpn
 ip nhrp network-id 100
<span class="c">! multicast (IGP hellos) har register hone wale spoke ko copy</span>
 ip nhrp map multicast dynamic
 ip nhrp holdtime 300
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint</pre>
<p>Dekho kya missing hai: na <code>tunnel destination</code>, na <code>ip nhrp nhs</code>, na koi spoke address. Hub har spoke ko uski registration se seekhta hai.</p>

<h3>Step 2: spokes (NHC)</h3>
<pre class="code"><span class="c">! SPOKE1 (Pune). SPOKE2 par sirf IP badal kar 172.16.100.3</span>
interface Tunnel0
 description DMVPN spoke
 ip address 172.16.100.2 255.255.255.0
 no ip redirects
 ip nhrp authentication NKdmvpn
 ip nhrp network-id 100
<span class="c">! 1. underlay mein hub kahan hai</span>
 ip nhrp map 172.16.100.1 100.64.10.2
<span class="c">! 2. multicast (hellos) hub ko bhejo</span>
 ip nhrp map multicast 100.64.10.2
<span class="c">! 3. is server ke saath register karo</span>
 ip nhrp nhs 172.16.100.1
 ip nhrp holdtime 300
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint</pre>
<p>Naye IOS aur IOS XE releases ek line accept karte hain jo teeno NHRP lines ki jagah le leti hai: <code>ip nhrp nhs 172.16.100.1 nbma 100.64.10.2 multicast</code>. Exam questions mein dono forms aate hain, isliye dono padhna aana chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Spoke par har NHRP line kya karti hai">
<defs><marker id="b4h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="70" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">SPOKE1</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">172.16.100.2</text>
<rect x="470" y="70" width="150" height="70" rx="8" fill="#bae6fd"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">.1 = 100.64.10.2</text>
<line x1="170" y1="80" x2="466" y2="80" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4h)"/><text x="318" y="72" text-anchor="middle" class="svg-ink" font-size="12">map .1 to 100.64.10.2 (kaise pahunchein)</text>
<line x1="170" y1="105" x2="466" y2="105" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4h)"/><text x="318" y="98" text-anchor="middle" class="svg-ink" font-size="12">nhs .1 (yahan register karo)</text>
<line x1="170" y1="130" x2="466" y2="130" stroke="#64748b" stroke-width="1.5" marker-end="url(#b4h)"/><text x="318" y="123" text-anchor="middle" class="svg-ink" font-size="12">map multicast (hellos hub ko)</text>
<line x1="466" y1="165" x2="174" y2="165" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#b4h)"/><text x="318" y="185" text-anchor="middle" class="svg-accent" font-size="12">hub: map multicast dynamic (hellos har registered spoke ko)</text>
</svg><p class="cap">Spoke ki teen lines hub ki taraf point karti hain; hub ki ek line register karne wale ki taraf wapas.</p></div>

<h3>Verification: kya spoke registered hai?</h3>
<p>Hamesha dono taraf se check karo. Spoke par NHS <b>RE</b> (responding) hona chahiye. Hub par har spoke dynamic peer ki tarah dikhna chahiye.</p>
<pre class="out">SPOKE1# show ip nhrp nhs detail
Legend: E=Expecting replies, R=Responding, W=Waiting, D=Dynamic
Tunnel0:
<span class="hl">172.16.100.1  RE NBMA Address: 100.64.10.2 priority = 0 cluster = 0  req-sent 9  req-failed 0  repl-recv 9 (00:00:38 ago)</span></pre>
<pre class="out">HUB# show dmvpn
Legend: Attrb --&gt; S - Static, D - Dynamic, I - Incomplete
        T1 - Route Installed, T2 - Nexthop-override
        NHS Status: E --&gt; Expecting Replies, R --&gt; Responding, W --&gt; Waiting
==========================================================================
Interface: Tunnel0, IPv4 NHRP Details
<span class="hl">Type:Hub, NHRP Peers:2,</span>

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
<span class="hl">     1 100.64.20.2        172.16.100.2    UP 00:12:40     D</span>
<span class="hl">     1 100.64.30.2        172.16.100.3    UP 00:12:31     D</span></pre>
<pre class="out">SPOKE1# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:1,

 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
<span class="hl">     1 100.64.10.2        172.16.100.1    UP 00:12:40     S</span></pre>
<p><code>show dmvpn</code> kaise padhein: har NBMA peer ki ek line. <b>State UP</b> matlab us peer ke saath NHRP chal raha hai; State column mein <b>NHRP</b> matlab mapping hai lekin registration successful nahi hui; wahan <b>IKE</b> ya <b>IPSEC</b> matlab crypto part abhi negotiate ho raha hai. <b>Attrb S</b> static mapping hai (spoke par hub), <b>D</b> dynamic hai (registration ya resolution se seekha). <code>show dmvpn detail</code> har peer ke crypto sessions bhi jodta hai.</p>

<div class="eg"><p><b>Worked example.</b> Teesri branch Jaipur jodo, NBMA 100.64.40.2 ke saath. Uska Tunnel0 SPOKE1 ki copy hai, bas <code>ip address 172.16.100.4 255.255.255.0</code>. Hub par kuch nahi badalta. Tunnel up hone ke lagbhag ek second baad hub "NHRP Peers:3" aur 100.64.40.2 / 172.16.100.4 ki teesri D line dikhata hai. 300 s holdtime ke saath spoke har 100 s par refresh karta hai, isliye Jaipur par <code>req-sent</code> har ghante lagbhag 36 badhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>ip nhrp nhs</code> ko hub ke tunnel address ki jagah uske <b>public</b> address par point karna. (2) NHS address mein typo, jaise 172.16.100.11: spoke aise address par requests bhejta rehta hai jo kisi ka nahi hai aur NHS <b>E</b> par atka rehta hai. (3) Hub tunnel IP ko galat NBMA address se map karna. (4) Alag authentication strings. Chaaron same dikhte hain: NHS kabhi RE tak nahi pahunchta aur hub par koi entry nahi hoti.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip nhrp nhs</code> mein akela <b>E</b> matlab "expecting replies": requests ja rahi hain lekin wapas kuch nahi aa raha. <b>RE</b> matlab responding aur expected. Aur hub par <code>show dmvpn</code> spokes ke liye <b>D</b> dikhata hai, kabhi S nahi, kyunki hub par unki koi static maps nahi hoti.</p></div>

<div class="scn"><h4>Copy-paste spoke jo kabhi register nahi hua</h4><p>Ek naya branch router DMVPN template ke saath up hua, tunnel up/up tha, lekin hub use list nahi kar raha tha. <code>show ip nhrp nhs detail</code> ne NHS ko state E mein dikhaya, req-sent badh raha tha aur repl-recv 0 tha. Working spoke se compare karne par <code>ip nhrp nhs 100.64.10.2</code> mila: installer ne hub ka public address type kar diya tha. Ise <code>ip nhrp nhs 172.16.100.1</code> se badalte hi NHS seconds mein RE ho gaya.</p><p><b>Seekh:</b> NHS = tunnel address; static map = tunnel address se NBMA address. Pehle <code>show ip nhrp nhs detail</code> check karo.</p></div>

<div class="iv"><p class="q">"DMVPN spoke ko minimum kaunsi configuration chahiye, aur hub ko har spoke ke liye kuch kyun nahi chahiye?"</p><p>Strong answer: source aur IP ke saath mGRE tunnel, NHRP network-id aur matching authentication, hub tunnel IP ki uske NBMA address se static NHRP mapping, hub ki taraf multicast mapping, aur hub as NHS. Hub ko sirf mGRE, NHRP aur <code>map multicast dynamic</code> chahiye, kyunki har spoke apni mapping khud register karta hai. Ek-line <code>ip nhrp nhs ... nbma ... multicast</code> form aur <code>show ip nhrp nhs</code> aur <code>show dmvpn</code> se verification ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub: mGRE + network-id + authentication + <code>map multicast dynamic</code> + holdtime. Har spoke ke liye koi line nahi.</li>
<li>Spoke: hub NBMA ki static map, hub ko multicast, NHS = hub tunnel IP.</li>
<li><code>ip nhrp nhs 172.16.100.1 nbma 100.64.10.2 multicast</code> modern one-liner hai.</li>
<li>Spoke par <code>show ip nhrp nhs detail</code> (RE) aur hub par <code>show dmvpn</code> (D entries) se verify karo.</li>
<li>State UP = chal raha hai; NHRP = mapped lekin registered nahi; Attrb S = static, D = dynamic.</li>
</ul></div>
`}};export{e as default};