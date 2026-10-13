var e={id:`ios-server`,h:{en:`Configuring a Cisco router as a DHCP server`,hi:`Cisco router ko DHCP server configure karna`},body:{en:`
<p>In a small office or a branch, a separate Windows or Linux DHCP server is often overkill. The router is already there, already the default gateway, and Cisco IOS has a full DHCP server built in. In large enterprises the server usually lives in the data center and the routers only relay, but the pool logic you learn here is the same everywhere.</p>

<h3>The plan before the commands</h3>
<p>Before typing anything, write down four decisions for each subnet:</p>
<ol>
<li><b>The subnet</b>: 192.168.10.0/24 for the campus.</li>
<li><b>The reserved range</b>: addresses that must never be handed out (gateway, switches, printers, servers). The lab reserves .1 to .20.</li>
<li><b>The options</b>: gateway 192.168.10.1, DNS 10.1.100.53, domain nwk.lab.</li>
<li><b>The lease</b>: the default one day is fine for a campus; a busy guest Wi-Fi might use a few hours.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Campus subnet split into excluded and dynamic ranges">
<rect x="20" y="40" width="70" height="44" fill="#fed7aa"/><rect x="90" y="40" width="530" height="44" fill="#bbf7d0"/>
<text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="13">.1–.20</text>
<text x="355" y="67" text-anchor="middle" class="svg-ink" font-size="13">.21–.254 handed out by pool LAN10</text>
<text x="55" y="110" text-anchor="middle" class="svg-muted" font-size="12">excluded</text>
<text x="55" y="126" text-anchor="middle" class="svg-muted" font-size="12">(gateway, printers)</text>
<text x="355" y="110" text-anchor="middle" class="svg-muted" font-size="12">first client gets .21</text>
<text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="13">192.168.10.0/24</text>
</svg><p class="cap">Exclusions carve infrastructure addresses out of the pool's network.</p></div>

<h3>Step 1: exclude the reserved addresses (global config)</h3>
<pre class="code">R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20
R1(config)# ip dhcp excluded-address 192.168.20.1 192.168.20.20
<span class="c">! a single address is also fine:</span>
R1(config)# ip dhcp excluded-address 192.168.10.250</pre>
<p><code>ip dhcp excluded-address</code> takes a first and an optional last address. It is a <b>global</b> command, not a pool command, and it applies to every pool on the router. Configure exclusions <b>before</b> the pool, so no client can grab a reserved address in the seconds between creating the pool and excluding the range.</p>

<h3>Step 2: create the pool and its options</h3>
<pre class="code">R1(config)# ip dhcp pool LAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 10.1.100.53
R1(dhcp-config)# domain-name nwk.lab
R1(dhcp-config)# lease 2 12
R1(dhcp-config)# exit</pre>
<dl class="terms">
<dt><code>ip dhcp pool NAME</code></dt><dd>Creates the pool and enters <code>(dhcp-config)</code> mode. The name is local; use something meaningful.</dd>
<dt><code>network</code></dt><dd>The subnet and mask (or prefix, <code>/24</code>) the pool serves. This also supplies option 1.</dd>
<dt><code>default-router</code></dt><dd>Option 3. Up to eight addresses; the first is preferred.</dd>
<dt><code>dns-server</code></dt><dd>Option 6. Up to eight addresses.</dd>
<dt><code>domain-name</code></dt><dd>Option 15, the DNS suffix.</dd>
<dt><code>lease days [hours [minutes]]</code></dt><dd>Option 51. <code>lease 2 12</code> = 2 days 12 hours; <code>lease infinite</code> never expires. Default 1 day.</dd>
</dl>

<h3>Step 3: the second pool (for the relayed annex)</h3>
<pre class="code">R1(config)# ip dhcp pool LAN20
R1(dhcp-config)# network 192.168.20.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.20.1
R1(dhcp-config)# dns-server 10.1.100.53
R1(dhcp-config)# domain-name nwk.lab</pre>
<p>Notice the gateway: <b>192.168.20.1 is R2's LAN address</b>, not R1's. The pool describes the client's subnet, wherever the server happens to sit. This is the most common mistake in the lab.</p>

<h3>How the server chooses a pool</h3>
<p>R1 has two pools. When a Discover arrives, which one answers? The server looks at <b>where the request came from</b>:</p>
<ul>
<li>A <b>local broadcast</b> arriving on Gi0/0 (192.168.10.1/24): the server uses the pool whose <code>network</code> contains the receiving interface's address, so LAN10.</li>
<li>A <b>relayed</b> request: the server uses the <b>giaddr</b> the relay filled in (192.168.20.1), which falls inside LAN20.</li>
</ul>
<p>If no pool matches, the server silently ignores the request. There is no error message on the client beyond "no answer".</p>

<div class="eg"><p><b>Worked example: how many addresses are left?</b> 192.168.10.0/24 has 254 usable hosts (.1 to .254). Excluding .1–.20 removes 20, leaving <b>234</b> leasable addresses. The first client gets .21, because the server hands out the lowest free address that is not excluded, not already bound and not answering its ping check.</p></div>

<h3>Services, conflicts and the ping check</h3>
<p>The DHCP server and relay are controlled by <code>service dhcp</code>, which is <b>on by default</b>. If someone typed <code>no service dhcp</code> (sometimes done in hardening templates), both the server and <code>ip helper-address</code> relaying stop working, and <code>show running-config</code> shows the line <code>no service dhcp</code>.</p>
<p>Before offering an address IOS sends two pings to it (<code>ip dhcp ping packets 2</code>, timeout 500 ms). If it gets a reply, a statically configured host is using it: the address is moved to the conflict table and skipped. You clear the table with <code>clear ip dhcp conflict *</code> after fixing the static host.</p>

<h3>Manual bindings (reservations)</h3>
<p>Sometimes a device should always get the same address from DHCP, like a printer. IOS does that with a host pool:</p>
<pre class="code">R1(config)# ip dhcp pool PRINTER-LAB2
R1(dhcp-config)# host 192.168.10.15 255.255.255.0
R1(dhcp-config)# client-identifier 0100.5079.6668.0f
R1(dhcp-config)# default-router 192.168.10.1</pre>
<p>The client identifier is <code>01</code> (Ethernet) followed by the MAC. For the CCNA, it is enough to know reservations exist and are tied to the client's identity.</p>

<pre class="out">R1# show running-config | section dhcp
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp excluded-address 192.168.20.1 192.168.20.20
ip dhcp pool LAN10
 <span class="hl">network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1</span>
 dns-server 10.1.100.53
 domain-name nwk.lab
 lease 2 12
ip dhcp pool LAN20
 network 192.168.20.0 255.255.255.0
 <span class="hl">default-router 192.168.20.1</span>
 dns-server 10.1.100.53
 domain-name nwk.lab</pre>

<div class="warn"><p><b>Common mistakes.</b> Putting exclusions inside the pool (they are global). Excluding <code>192.168.10.1 192.168.10.254</code> by accident, which leaves nothing to lease. Copy-pasting LAN10 into LAN20 and forgetting to change <code>default-router</code>. Forgetting <code>network</code>: a pool without it never answers.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip dhcp excluded-address</code> = global config. <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code> = dhcp-config mode. The lease syntax is days, hours, minutes. <code>service dhcp</code> is on by default.</p></div>

<div class="scn"><h4>The printer that kept changing IP</h4><p>A branch had configured R1 as DHCP server but excluded only the gateway. The shared printer, set statically to 192.168.10.5, kept dropping off: every few days a laptop was offered .5, the ping check sometimes missed the sleeping printer, and the two fought over the address. <code>show ip dhcp conflict</code> had several entries for .5. The engineer excluded .1–.20, moved the printer inside that range, cleared the conflicts and released the laptop's lease.</p><p><b>Lesson:</b> every static device must sit inside an excluded range. The ping check is a safety net, not a plan.</p></div>

<div class="iv"><p class="q">"Configure a router to serve 192.168.10.0/24 but keep the first 20 addresses for infrastructure."</p><p>Say the commands in order: global <code>ip dhcp excluded-address 192.168.10.1 192.168.10.20</code> first, then <code>ip dhcp pool</code> with <code>network</code>, <code>default-router</code>, <code>dns-server</code>, optional <code>domain-name</code> and <code>lease</code>. Explain why exclusions come first, that they are global, and that the server matches pools by receiving interface or giaddr. Finish with verification: <code>show ip dhcp pool</code> and <code>show ip dhcp binding</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan per subnet: network, excluded range, options, lease.</li>
<li><code>ip dhcp excluded-address</code> is global and should be configured before the pool.</li>
<li>Pool commands: <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code>.</li>
<li>The server picks the pool by receiving interface (local) or giaddr (relayed).</li>
<li>For a relayed subnet the gateway is the remote router's LAN address.</li>
</ul></div>
`,hi:`
<p>Chhote office ya branch mein alag Windows ya Linux DHCP server aksar zaroorat se zyada hota hai. Router pehle se wahan hai, pehle se default gateway hai, aur Cisco IOS mein poora DHCP server built-in hai. Bade enterprises mein server aam taur par data center mein hota hai aur routers sirf relay karte hain, lekin jo pool logic aap yahan seekhoge woh har jagah same hai.</p>

<h3>Commands se pehle plan</h3>
<p>Kuch bhi type karne se pehle har subnet ke liye chaar decisions likh lo:</p>
<ol>
<li><b>Subnet</b>: campus ke liye 192.168.10.0/24.</li>
<li><b>Reserved range</b>: woh addresses jo kabhi hand out nahi hone chahiye (gateway, switches, printers, servers). Lab .1 se .20 reserve karta hai.</li>
<li><b>Options</b>: gateway 192.168.10.1, DNS 10.1.100.53, domain nwk.lab.</li>
<li><b>Lease</b>: campus ke liye default ek din theek hai; busy guest Wi-Fi kuch ghante use kar sakta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Campus subnet excluded aur dynamic ranges mein bata hua">
<rect x="20" y="40" width="70" height="44" fill="#fed7aa"/><rect x="90" y="40" width="530" height="44" fill="#bbf7d0"/>
<text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="13">.1–.20</text>
<text x="355" y="67" text-anchor="middle" class="svg-ink" font-size="13">.21–.254 pool LAN10 deta hai</text>
<text x="55" y="110" text-anchor="middle" class="svg-muted" font-size="12">excluded</text>
<text x="55" y="126" text-anchor="middle" class="svg-muted" font-size="12">(gateway, printers)</text>
<text x="355" y="110" text-anchor="middle" class="svg-muted" font-size="12">pehle client ko .21 milta hai</text>
<text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="13">192.168.10.0/24</text>
</svg><p class="cap">Exclusions pool ke network se infrastructure addresses alag kar dete hain.</p></div>

<h3>Step 1: reserved addresses exclude karo (global config)</h3>
<pre class="code">R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20
R1(config)# ip dhcp excluded-address 192.168.20.1 192.168.20.20
<span class="c">! ek single address bhi chalega:</span>
R1(config)# ip dhcp excluded-address 192.168.10.250</pre>
<p><code>ip dhcp excluded-address</code> ek first aur ek optional last address leta hai. Yeh <b>global</b> command hai, pool command nahi, aur router ke har pool par lagta hai. Exclusions pool se <b>pehle</b> configure karo, taaki pool banane aur range exclude karne ke beech ke seconds mein koi client reserved address na le le.</p>

<h3>Step 2: pool aur uske options banao</h3>
<pre class="code">R1(config)# ip dhcp pool LAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 10.1.100.53
R1(dhcp-config)# domain-name nwk.lab
R1(dhcp-config)# lease 2 12
R1(dhcp-config)# exit</pre>
<dl class="terms">
<dt><code>ip dhcp pool NAME</code></dt><dd>Pool banata hai aur <code>(dhcp-config)</code> mode mein le jaata hai. Naam local hai; kuch meaningful rakho.</dd>
<dt><code>network</code></dt><dd>Subnet aur mask (ya prefix, <code>/24</code>) jo pool serve karta hai. Yahi option 1 bhi deta hai.</dd>
<dt><code>default-router</code></dt><dd>Option 3. Aath tak addresses; pehla preferred hai.</dd>
<dt><code>dns-server</code></dt><dd>Option 6. Aath tak addresses.</dd>
<dt><code>domain-name</code></dt><dd>Option 15, DNS suffix.</dd>
<dt><code>lease days [hours [minutes]]</code></dt><dd>Option 51. <code>lease 2 12</code> = 2 din 12 ghante; <code>lease infinite</code> kabhi expire nahi hoti. Default 1 din.</dd>
</dl>

<h3>Step 3: dusra pool (relay hone wale annex ke liye)</h3>
<pre class="code">R1(config)# ip dhcp pool LAN20
R1(dhcp-config)# network 192.168.20.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.20.1
R1(dhcp-config)# dns-server 10.1.100.53
R1(dhcp-config)# domain-name nwk.lab</pre>
<p>Gateway dhyan se dekho: <b>192.168.20.1 R2 ka LAN address hai</b>, R1 ka nahi. Pool client ke subnet ko describe karta hai, server chahe kahin bhi baitha ho. Lab mein yeh sabse common galti hai.</p>

<h3>Server pool kaise chunta hai</h3>
<p>R1 ke paas do pools hain. Jab Discover aata hai, kaunsa jawab deta hai? Server dekhta hai <b>request kahan se aayi</b>:</p>
<ul>
<li>Gi0/0 (192.168.10.1/24) par aaya <b>local broadcast</b>: server woh pool use karta hai jiska <code>network</code> receiving interface ka address contain karta hai, yaani LAN10.</li>
<li><b>Relay hui</b> request: server relay ka bhara hua <b>giaddr</b> (192.168.20.1) use karta hai, jo LAN20 mein aata hai.</li>
</ul>
<p>Agar koi pool match na kare, server request ko chupchaap ignore kar deta hai. Client par "koi jawab nahi" ke alawa koi error message nahi aata.</p>

<div class="eg"><p><b>Worked example: kitne addresses bache?</b> 192.168.10.0/24 mein 254 usable hosts hain (.1 se .254). .1–.20 exclude karne se 20 hat jaate hain, <b>234</b> leasable addresses bachte hain. Pehle client ko .21 milta hai, kyunki server sabse chhota free address deta hai jo excluded na ho, pehle se bound na ho aur uske ping check ka jawab na de.</p></div>

<h3>Services, conflicts aur ping check</h3>
<p>DHCP server aur relay <code>service dhcp</code> se control hote hain, jo <b>default mein on</b> hai. Agar kisi ne <code>no service dhcp</code> type kar diya (kabhi kabhi hardening templates mein hota hai), to server aur <code>ip helper-address</code> relaying dono band ho jaate hain, aur <code>show running-config</code> mein line <code>no service dhcp</code> dikhti hai.</p>
<p>Address offer karne se pehle IOS use do pings bhejta hai (<code>ip dhcp ping packets 2</code>, timeout 500 ms). Agar reply aaye, to koi statically configured host use use kar raha hai: address conflict table mein chala jaata hai aur skip hota hai. Static host theek karne ke baad table <code>clear ip dhcp conflict *</code> se clear karte ho.</p>

<h3>Manual bindings (reservations)</h3>
<p>Kabhi kabhi kisi device ko DHCP se hamesha same address milna chahiye, jaise printer. IOS yeh host pool se karta hai:</p>
<pre class="code">R1(config)# ip dhcp pool PRINTER-LAB2
R1(dhcp-config)# host 192.168.10.15 255.255.255.0
R1(dhcp-config)# client-identifier 0100.5079.6668.0f
R1(dhcp-config)# default-router 192.168.10.1</pre>
<p>Client identifier <code>01</code> (Ethernet) ke baad MAC hota hai. CCNA ke liye itna jaanna kaafi hai ki reservations hoti hain aur client ki identity se judi hoti hain.</p>

<pre class="out">R1# show running-config | section dhcp
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp excluded-address 192.168.20.1 192.168.20.20
ip dhcp pool LAN10
 <span class="hl">network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1</span>
 dns-server 10.1.100.53
 domain-name nwk.lab
 lease 2 12
ip dhcp pool LAN20
 network 192.168.20.0 255.255.255.0
 <span class="hl">default-router 192.168.20.1</span>
 dns-server 10.1.100.53
 domain-name nwk.lab</pre>

<div class="warn"><p><b>Common galtiyan.</b> Exclusions pool ke andar daalna (woh global hain). Galti se <code>192.168.10.1 192.168.10.254</code> exclude kar dena, jisse lease karne ko kuch nahi bachta. LAN10 ko LAN20 mein copy-paste karke <code>default-router</code> badalna bhool jaana. <code>network</code> bhool jaana: uske bina pool kabhi jawab nahi deta.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip dhcp excluded-address</code> = global config. <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code> = dhcp-config mode. Lease syntax days, hours, minutes hai. <code>service dhcp</code> default mein on hai.</p></div>

<div class="scn"><h4>Printer jiska IP badalta rehta tha</h4><p>Ek branch ne R1 ko DHCP server configure kiya tha lekin sirf gateway exclude kiya tha. Shared printer, jo statically 192.168.10.5 par set tha, baar baar gayab ho jaata: har kuch din mein kisi laptop ko .5 offer hota, ping check kabhi kabhi soye hue printer ko miss kar deta, aur dono address ke liye ladte. <code>show ip dhcp conflict</code> mein .5 ki kai entries thi. Engineer ne .1–.20 exclude kiya, printer ko us range ke andar shift kiya, conflicts clear kiye aur laptop ki lease release karwayi.</p><p><b>Seekh:</b> har static device excluded range ke andar hona chahiye. Ping check safety net hai, plan nahi.</p></div>

<div class="iv"><p class="q">"Router ko 192.168.10.0/24 serve karne ke liye configure karo lekin pehle 20 addresses infrastructure ke liye rakho."</p><p>Commands order mein batao: pehle global <code>ip dhcp excluded-address 192.168.10.1 192.168.10.20</code>, phir <code>ip dhcp pool</code> ke saath <code>network</code>, <code>default-router</code>, <code>dns-server</code>, optional <code>domain-name</code> aur <code>lease</code>. Samjhao ki exclusions pehle kyun aate hain, ki woh global hain, aur server pools ko receiving interface ya giaddr se match karta hai. Verification ke saath khatam karo: <code>show ip dhcp pool</code> aur <code>show ip dhcp binding</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har subnet ke liye plan: network, excluded range, options, lease.</li>
<li><code>ip dhcp excluded-address</code> global hai aur pool se pehle configure karna chahiye.</li>
<li>Pool commands: <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code>.</li>
<li>Server pool ko receiving interface (local) ya giaddr (relayed) se chunta hai.</li>
<li>Relayed subnet ke liye gateway remote router ka LAN address hai.</li>
</ul></div>
`}};export{e as default};