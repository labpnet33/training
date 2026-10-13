var e={id:`overload-timers-authentication`,h:{en:`Operating IS-IS: overload bit, timers, metrics, passive interfaces and authentication`,hi:`IS-IS operate karna: overload bit, timers, metrics, passive interfaces aur authentication`},body:{en:`
<p>A working IS-IS network still needs care: you must take routers out of service without dropping traffic, tune how fast the network reacts, advertise loopbacks without opening adjacencies on customer links, and make sure that nobody can inject false routing information. This chapter collects those day-two tools. Where the simulator does not implement a command, it is shown as <b>reference configuration</b> and says so.</p>

<h3>1. The overload bit: draining a router for maintenance</h3>
<p>Setting the <b>overload (OL) bit</b> in a router's LSP tells all other routers: "I am still here, but do not send transit traffic through me." Routes to the router's own prefixes remain, but SPF no longer uses it as a path to anything else. Traffic shifts to other paths. When the router is back, clear the bit. Cisco also offers the bit at startup, so a rebooted router does not attract traffic until it has converged.</p>
<pre class="code"><span class="c">! Lab command (works in the simulator)</span>
router isis
 set-overload-bit
<span class="c">! Reference configuration, not simulated: wait 300 s after boot</span>
router isis
 set-overload-bit on-startup 300</pre>
<p>The effect on the lab's database, seen from R1 (the third number of ATT/P/OL is the OL bit):</p>
<pre class="out">R1# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00            * 0x00000004   0x0AD2        1172/*                 0/0/0
R2.00-00              0x0000000A   0x5B5F        1200/1200              1/0/<span class="hl">1</span></pre>
<p>R2's LSP has a new sequence number (0xA instead of 0x9) and OL = 1. R2 is now drained. Other routers keep the adjacency and the database entry, so there is no hold-time expiry or reconvergence storm when it returns.</p>

<h3>2. Interface metrics and timers</h3>
<p>Every IS-IS interface on IOS starts with metric 10, whatever the speed. To prefer one path, raise the metric on the others (chapter 4 of spcor-isis-design explores design choices). Hello timing can also be tuned per interface. In the lab:</p>
<pre class="out">R2# show running-config interface g0/0
interface GigabitEthernet0/0
 ip address 10.1.12.2 255.255.255.0
 ip router isis
 isis network point-to-point
 <span class="hl">isis metric 30</span>
 <span class="hl">isis hello-interval 3</span>
 <span class="hl">isis hello-multiplier 4</span>

R2# show clns interface g0/0
    Level-1 Metric: 30, Priority: 64, Circuit ID: R2.00
    Level-2 Metric: 30, Priority: 64, Circuit ID: R2.00
    Next IS-IS Hello in 3 seconds</pre>
<p>Hello interval 3 s times multiplier 4 gives a hold time of 12 s instead of the default 30 s, so a dead neighbour is noticed faster. The metric is advertised at 30 on both levels. For sub-second detection, providers do not push hello timers to the limit; they use <b>BFD</b> instead (spcor-ha module). Reference commands: <code>bfd all-interfaces</code> under <code>router isis</code> and <code>bfd interval 300 min_rx 300 multiplier 3</code> on the interface; not simulated here.</p>
<p>Other timers worth knowing as reference: <code>spf-interval</code>, <code>prc-interval</code> and <code>lsp-gen-interval</code> throttle how often SPF, partial route calculation and LSP regeneration run, each with a maximum wait, an initial wait and a second wait (exponential backoff). They protect the CPU in a flapping network. Defaults are fine for most designs; change them only after measuring.</p>

<h3>3. Passive interfaces and advertising loopbacks</h3>
<p>A <b>passive interface</b> is advertised in the LSP but sends no hellos, so no adjacency can form on it. Use it on loopbacks (which have nothing to talk to) and on customer-facing links. In the lab form:</p>
<pre class="code">router isis
 passive-interface Loopback0
 passive-interface GigabitEthernet0/2    <span class="c">! customer link: advertised, no hellos</span></pre>
<p>On large networks, reference command <code>advertise passive-only</code> under <code>router isis</code> advertises only the prefixes of passive interfaces and leaves out the transit link prefixes; it shrinks the table and the attack surface. It needs BGP or LDP to use loopbacks everywhere, which is the provider design anyway.</p>

<h3>4. Authentication: only trusted routers may join</h3>
<p>Without authentication anyone who plugs a router into a core link can send IS-IS hellos or LSPs. Defence uses three scopes: <b>hello authentication</b> (interface level, protects adjacencies), <b>area authentication</b> (level-1 LSPs and SNPs) and <b>domain authentication</b> (level-2 LSPs and SNPs). Cisco IOS XE builds them on a key chain. This is reference configuration, not simulated in the lab, and syntax can vary with the release; verify it on your platform:</p>
<pre class="code"><span class="c">! Reference configuration (secrets are placeholders)</span>
key chain ISIS-KEYS
 key 1
  key-string &lt;secret&gt;
interface GigabitEthernet0/1
 isis authentication mode md5 level-2
 isis authentication key-chain ISIS-KEYS level-2
router isis
 authentication mode md5 level-2
 authentication key-chain ISIS-KEYS level-2</pre>
<p>Both ends must match, or no adjacency (hello authentication) or no LSP acceptance (area and domain authentication) results. MD5 is old; where the platform and release support it, prefer the HMAC-SHA algorithms of RFC 5310 through the key chain, and rotate keys with overlapping lifetimes. Authentication is one layer: also filter IS-IS from customer ports and use passive interfaces. The spcor-sp-security module covers more.</p>

<div class="eg"><p><b>Worked example.</b> R2 must be upgraded tonight. The engineer sets <code>set-overload-bit</code> at 22:00, waits until <code>show ip route</code> on neighbours no longer uses R2 as a next hop, reboots at 22:15, and after the reboot leaves <code>set-overload-bit on-startup 300</code> in place so that R2 only takes transit traffic after five minutes. Customers never notice.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting aggressive hello timers on both ends but not matching them: IS-IS does not require equal intervals because the hold time comes from the sender's hello, but a mismatch with a slow neighbour can cause flaps. (2) Enabling authentication on one end first: the adjacency drops. Plan it as a coordinated change (use <code>commit confirmed</code> logic or an out-of-band path). (3) Forgetting to clear overload after maintenance: the router stays drained and silently carries no transit traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> The OL bit does not make the router unreachable: its own loopback and connected prefixes are still reachable; only transit is avoided. And hello authentication, area authentication and domain authentication are different things with different scopes.</p></div>

<div class="scn"><h4>The router that stayed quiet</h4><p>After a weekend maintenance, traffic through one core router stayed at zero for days. The engineer checked the interfaces (up) and the neighbours (up). Then <code>show isis database</code> showed OL = 1 on that router's LSP: the overload bit from the maintenance was never cleared. Removing <code>set-overload-bit</code> brought traffic back within a minute.</p><p><b>Lesson:</b> neighbours up and routes present does not mean the router is a transit candidate. Read the OL column.</p></div>

<div class="iv"><p class="q">"How would you take a core router out of service without dropping traffic?"</p><p>Set the overload bit so that other routers stop using it for transit, wait until traffic moves away, do the work, then clear the bit. Mention <code>set-overload-bit on-startup</code> to avoid blackholing while the router converges after a reboot, and that BFD and fast reroute reduce the loss on unplanned failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The OL bit drains a router: neighbours stay, transit stops.</li>
<li>Interface metric (default 10) and hello timers are per-interface; use BFD for fast detection.</li>
<li>Passive interfaces are advertised without forming adjacencies.</li>
<li>Authentication has three scopes: hello, area and domain, built on key chains.</li>
<li>SPF, PRC and LSP throttles protect the CPU; tune only after measuring.</li>
</ul></div>
`,hi:`
<p>Chalta hua IS-IS network bhi dhyan maangta hai: routers ko traffic girae bina service se nikalna hota hai, network kitni tez react kare yeh tune karna hota hai, customer links par adjacency kholne ke bina loopbacks advertise karne hote hain, aur yeh pakka karna hota hai ki koi galat routing information inject na kar sake. Yeh chapter in day-two tools ko ikattha karta hai. Jahan simulator command implement nahi karta, use <b>reference configuration</b> ki tarah dikhaya gaya hai aur likha hai.</p>

<h3>1. Overload bit: maintenance ke liye router drain karna</h3>
<p>Router ke LSP mein <b>overload (OL) bit</b> set karna baaki sab routers ko kehta hai: "Main yahin hoon, par mere through transit traffic mat bhejo." Router ke apne prefixes ke routes rehte hain, par SPF use ab kisi aur cheez ke path ki tarah use nahi karta. Traffic doosre paths par chala jaata hai. Router wapas aaye to bit clear karo. Cisco startup par bhi bit deta hai, taaki reboot hua router converge hone tak traffic na kheeche.</p>
<pre class="code"><span class="c">! Lab command (simulator mein chalta hai)</span>
router isis
 set-overload-bit
<span class="c">! Reference configuration, simulate nahi hota: boot ke baad 300 s wait</span>
router isis
 set-overload-bit on-startup 300</pre>
<p>Lab ke database par asar, R1 se dekha (ATT/P/OL ka teesra number OL bit hai):</p>
<pre class="out">R1# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00            * 0x00000004   0x0AD2        1172/*                 0/0/0
R2.00-00              0x0000000A   0x5B5F        1200/1200              1/0/<span class="hl">1</span></pre>
<p>R2 ke LSP ka naya sequence number hai (0x9 ki jagah 0xA) aur OL = 1. R2 ab drain ho gaya. Doosre routers adjacency aur database entry rakhte hain, isliye jab woh wapas aata hai to hold-time expiry ya reconvergence storm nahi hota.</p>

<h3>2. Interface metrics aur timers</h3>
<p>IOS par har IS-IS interface metric 10 se shuru hota hai, speed kuch bhi ho. Ek path prefer karne ke liye baaki par metric badhao (spcor-isis-design ka chapter 4 design choices explore karta hai). Hello timing bhi per-interface tune ho sakti hai. Lab mein:</p>
<pre class="out">R2# show running-config interface g0/0
interface GigabitEthernet0/0
 ip address 10.1.12.2 255.255.255.0
 ip router isis
 isis network point-to-point
 <span class="hl">isis metric 30</span>
 <span class="hl">isis hello-interval 3</span>
 <span class="hl">isis hello-multiplier 4</span>

R2# show clns interface g0/0
    Level-1 Metric: 30, Priority: 64, Circuit ID: R2.00
    Level-2 Metric: 30, Priority: 64, Circuit ID: R2.00
    Next IS-IS Hello in 3 seconds</pre>
<p>Hello interval 3 s guna multiplier 4 se hold time 12 s hota hai default 30 s ki jagah, isliye dead neighbour jaldi pakda jaata hai. Metric dono levels par 30 advertise hota hai. Sub-second detection ke liye providers hello timers ko limit tak nahi khinchte; woh iski jagah <b>BFD</b> use karte hain (spcor-ha module). Reference commands: <code>router isis</code> ke neeche <code>bfd all-interfaces</code> aur interface par <code>bfd interval 300 min_rx 300 multiplier 3</code>; yahan simulate nahi hote.</p>
<p>Reference ke taur par aur timers jaanne layak: <code>spf-interval</code>, <code>prc-interval</code> aur <code>lsp-gen-interval</code> throttle karte hain ki SPF, partial route calculation aur LSP regeneration kitni baar chalein, har ek maximum wait, initial wait aur second wait (exponential backoff) ke saath. Woh flapping network mein CPU ko bachate hain. Zyadatar designs ke liye defaults theek hain; naapne ke baad hi badlo.</p>

<h3>3. Passive interfaces aur loopbacks advertise karna</h3>
<p><b>Passive interface</b> LSP mein advertise hota hai par hellos nahi bhejta, isliye us par adjacency nahi ban sakti. Ise loopbacks (jinse baat karne ko kuch nahi) aur customer-facing links par use karo. Lab form:</p>
<pre class="code">router isis
 passive-interface Loopback0
 passive-interface GigabitEthernet0/2    <span class="c">! customer link: advertise, hellos nahi</span></pre>
<p>Bade networks par reference command <code>router isis</code> ke neeche <code>advertise passive-only</code> sirf passive interfaces ke prefixes advertise karta hai aur transit link prefixes chhod deta hai; yeh table aur attack surface dono chhote karta hai. Isme har jagah BGP ya LDP ko loopbacks use karne chahiye, jo waise bhi provider design hai.</p>

<h3>4. Authentication: sirf trusted routers join kar saken</h3>
<p>Authentication ke bina jo bhi core link mein router lagaye woh IS-IS hellos ya LSPs bhej sakta hai. Defence teen scopes use karta hai: <b>hello authentication</b> (interface level, adjacencies ko protect karta hai), <b>area authentication</b> (level-1 LSPs aur SNPs) aur <b>domain authentication</b> (level-2 LSPs aur SNPs). Cisco IOS XE inhe key chain par banata hai. Yeh reference configuration hai, lab mein simulate nahi hota, aur syntax release ke saath badal sakta hai; apne platform par verify karo:</p>
<pre class="code"><span class="c">! Reference configuration (secrets placeholder hain)</span>
key chain ISIS-KEYS
 key 1
  key-string &lt;secret&gt;
interface GigabitEthernet0/1
 isis authentication mode md5 level-2
 isis authentication key-chain ISIS-KEYS level-2
router isis
 authentication mode md5 level-2
 authentication key-chain ISIS-KEYS level-2</pre>
<p>Dono ends match karne chahiye, warna adjacency nahi (hello authentication) ya LSP acceptance nahi (area aur domain authentication) hoga. MD5 purana hai; jahan platform aur release support karein, key chain ke through RFC 5310 ke HMAC-SHA algorithms prefer karo, aur keys ko overlapping lifetimes ke saath rotate karo. Authentication ek layer hai: customer ports se IS-IS filter bhi karo aur passive interfaces use karo. spcor-sp-security module aur cover karta hai.</p>

<div class="eg"><p><b>Worked example.</b> R2 ko aaj raat upgrade karna hai. Engineer 22:00 par <code>set-overload-bit</code> lagata hai, tab tak wait karta hai jab tak neighbours par <code>show ip route</code> R2 ko next hop ki tarah use karna band na kare, 22:15 par reboot karta hai, aur reboot ke baad <code>set-overload-bit on-startup 300</code> rehne deta hai taaki R2 paanch minute baad hi transit traffic le. Customers ko pata hi nahi chalta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Dono ends par aggressive hello timers set karna par match na karna: IS-IS ko equal intervals zaroori nahi kyunki hold time sender ke hello se aata hai, par slow neighbour ke saath mismatch flaps de sakta hai. (2) Pehle ek end par authentication enable karna: adjacency drop ho jaati hai. Ise coordinated change ki tarah plan karo (<code>commit confirmed</code> jaisa logic ya out-of-band path use karo). (3) Maintenance ke baad overload clear karna bhool jaana: router drain rehta hai aur chupchap transit traffic nahi le jaata.</p></div>
<div class="exam"><p><b>Exam trap.</b> OL bit router ko unreachable nahi banata: uska apna loopback aur connected prefixes reachable rehte hain; sirf transit se bacha jaata hai. Aur hello authentication, area authentication aur domain authentication alag cheezein hain jinke scope alag hain.</p></div>

<div class="scn"><h4>Woh router jo chup raha</h4><p>Weekend maintenance ke baad ek core router se guzarne wala traffic kai din zero raha. Engineer ne interfaces (up) aur neighbours (up) check kiye. Phir <code>show isis database</code> ne us router ke LSP par OL = 1 dikhaya: maintenance ka overload bit kabhi clear nahi hua tha. <code>set-overload-bit</code> hatane se traffic ek minute mein wapas aa gaya.</p><p><b>Lesson:</b> neighbours up aur routes present ka matlab yeh nahi ki router transit candidate hai. OL column padho.</p></div>

<div class="iv"><p class="q">"Core router ko traffic girae bina service se kaise nikaloge?"</p><p>Overload bit set karo taaki doosre routers use transit ke liye use karna band kar dein, traffic hatne tak wait karo, kaam karo, phir bit clear karo. Reboot ke baad router converge hone tak blackholing se bachne ke liye <code>set-overload-bit on-startup</code> ka zikr karo, aur yeh ki BFD aur fast reroute unplanned failures mein loss kam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OL bit router drain karta hai: neighbours rehte hain, transit ruk jaata hai.</li>
<li>Interface metric (default 10) aur hello timers per-interface hain; fast detection ke liye BFD use karo.</li>
<li>Passive interfaces adjacency banaye bina advertise hote hain.</li>
<li>Authentication ke teen scopes hain: hello, area aur domain, key chains par based.</li>
<li>SPF, PRC aur LSP throttles CPU bachate hain; naapne ke baad hi tune karo.</li>
</ul></div>
`}};export{e as default};