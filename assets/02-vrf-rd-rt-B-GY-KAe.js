var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RD and RT"><rect x="20" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">PE1 VRF CUST_A</text><text x="105" y="75" text-anchor="middle" class="svg-muted" font-size="12">RD 65000:1</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">export RT 65000:1</text><rect x="450" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">PE2 VRF CUST_A</text><text x="535" y="75" text-anchor="middle" class="svg-muted" font-size="12">RD 65000:1</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">import RT 65000:1</text><line x1="190" y1="65" x2="450" y2="65" stroke="#64748b" stroke-width="2"/><text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="11">65000:1:172.16.1.0/24 + RT 65000:1</text><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`vrf-rd-rt`,h:{en:`VRFs, route distinguishers and route targets`,hi:`VRFs, route distinguishers aur route targets`},body:{en:`
<p>This chapter separates three things beginners often mix up: the <b>VRF</b> (a table), the <b>RD</b> (an address prefix that makes routes unique) and the <b>RT</b> (a tag that decides who may use a route).</p>

<h3>VRF: a private routing table on the PE</h3>
<p>A <b>VRF</b> (virtual routing and forwarding instance) is a separate routing table, and a separate forwarding table, on a PE. Each customer-facing interface belongs to exactly one VRF. The global routing table (IS-IS, core) is another table. Because the tables are separate, two customers can use the same address space and the PE keeps them apart. In IOS XE the modern syntax is <code>vrf definition</code>:</p>
<pre class="code">vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
 exit-address-family</pre>
<p>The VRF name has only local meaning on the router. PE1 and PE2 could use different names for the same VPN: what matters is the RD and RTs.</p>

<h3>Route distinguisher (RD): uniqueness</h3>
<p>BGP identifies a route by its prefix. If two customers advertise 172.16.1.0/24, BGP would treat them as the same route and keep only one. The <b>RD</b> is an 8-byte value written <code>ASN:number</code> (65000:1) that is put in front of every customer IPv4 prefix to form a <b>VPNv4 prefix</b> (12 bytes): <code>65000:1:172.16.1.0/24</code>. Different RDs make overlapping prefixes unique inside BGP. Key points:</p>
<ul>
<li>The RD <b>does not</b> say which VRF may import the route. It only makes the route unique.</li>
<li>The RD is local to the PE's VRF. It can be the same on all PEs for a customer (simple) or different per PE (better for load sharing and fast convergence, because the RR then keeps all paths).</li>
<li>Use your own ASN (or a private one from the 64512 to 65534 range in a lab).</li>
</ul>

<h3>Route target (RT): policy</h3>
<p>An <b>RT</b> is a BGP <b>extended community</b> attached to the VPNv4 route. Two kinds of configuration:</p>
<dl class="terms">
<dt>export route-target</dt><dd>Added to every route the VRF advertises into VPNv4.</dd>
<dt>import route-target</dt><dd>A VRF imports every VPNv4 route that carries at least one of its import RTs.</dd>
<dt>route-target both X</dt><dd>Shorthand for import X and export X.</dd></dl>
@@D@@
<p>Because RTs are extended communities, the BGP session must <b>send extended communities</b> (<code>send-community extended</code>, chapter 4). If it does not, the RT is dropped on the way and nothing is imported.</p>

<h3>Verifying VRF configuration</h3>
<p>Real output from the lab after configuring both PEs with the same RD and RT:</p>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show vrf detail CUST_A
VRF CUST_A (VRF Id = 1); default RD 65000:1; default VPNID &lt;not set&gt;
  Interfaces:
    Gi0/1
Address family ipv4 unicast (Table ID = 0x1):
  Export VPN route-target communities
    <span class="hl">RT:65000:1</span>
  Import VPN route-target communities
    <span class="hl">RT:65000:1</span>
  No import route-map
  No export route-map</pre>
<p>Read the sections: <b>Export</b> list is what this VRF stamps on its routes; <b>Import</b> list is what it will accept. When two sites cannot see each other, compare PE1's Export list with PE2's Import list first.</p>

<div class="eg"><p><b>Worked example.</b> PE1 exports RT 65000:1 for CUST_A. PE2's VRF imports RT 65000:99. The route arrives at PE2 in the VPNv4 table but is not copied into the VRF, because 65000:99 is not on the route. The fix is to import 65000:1 on PE2 (this is lab 2, fault 1). Changing the RD would not help.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing that the same RD makes two sites see each other. Using different RTs on the two sides. Reusing one RD for two different customers on the same PE (the VRF table may differ but the VPNv4 prefixes then collide).</p></div>
<div class="exam"><p><b>Exam trap.</b> RD is 8 bytes; a VPNv4 address is 12 bytes (8 RD + 4 IPv4). RTs are extended communities. A VRF can have more than one import and export RT.</p></div>

<div class="scn"><h4>Site 2 sees nothing</h4><p>A new VPN was provisioned and site 2 could not reach site 1. Both PEs showed the same RD. <code>show vrf detail</code> revealed PE1 exported 65000:1 and PE2 imported 65000:99, a typo from a copy-paste. Fixing the import RT made the route appear within a minute.</p><p><b>Lesson:</b> compare export on one PE with import on the other.</p></div>

<div class="iv"><p class="q">"What is the difference between a route distinguisher and a route target?"</p><p>The RD is prepended to the prefix to make overlapping customer routes unique in the VPNv4 table. The RT is an extended community that controls which VRFs import a route and thus defines the VPN topology. RD does not influence import or export.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VRF is a separate routing and forwarding table on the PE.</li>
<li>RD (8 bytes) makes VPNv4 prefixes unique; it controls nothing else.</li>
<li>RT (extended community) decides import and export.</li>
<li>show vrf detail lists export and import RTs.</li>
<li>Unique RD per VRF per PE helps the RR keep every path.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 exports RT 65000:1 and PE2 imports it; the RD only makes the route unique.`,`export RT`,`import matches the RT on the route, not the RD`)),hi:`
<p>Is chapter mein teen cheezein alag ki gayi hain jinhe beginners aksar mix kar dete hain: <b>VRF</b> (ek table), <b>RD</b> (address prefix jo routes ko unique banata hai) aur <b>RT</b> (ek tag jo tay karta hai route kaun use kar sakta hai).</p>

<h3>VRF: PE par private routing table</h3>
<p><b>VRF</b> (virtual routing and forwarding instance) PE par alag routing table, aur alag forwarding table, hai. Har customer-facing interface bilkul ek VRF ka hota hai. Global routing table (IS-IS, core) ek aur table hai. Tables alag hone se do customers same address space use kar sakte hain aur PE unhe alag rakhta hai. IOS XE mein modern syntax <code>vrf definition</code> hai:</p>
<pre class="code">vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
 exit-address-family</pre>
<p>VRF ka naam sirf router par local meaning rakhta hai. PE1 aur PE2 ek hi VPN ke liye alag naam use kar sakte hain: matter RD aur RTs karte hain.</p>

<h3>Route distinguisher (RD): uniqueness</h3>
<p>BGP route ko uske prefix se pehchanta hai. Do customers 172.16.1.0/24 advertise karein to BGP unhe same route maanega aur sirf ek rakhega. <b>RD</b> 8-byte value hai jo <code>ASN:number</code> (65000:1) likhi jaati hai aur har customer IPv4 prefix ke aage lagti hai taaki <b>VPNv4 prefix</b> (12 bytes) bane: <code>65000:1:172.16.1.0/24</code>. Alag RDs overlapping prefixes ko BGP ke andar unique banate hain. Key points:</p>
<ul>
<li>RD yeh <b>nahi</b> batata ki kaunsa VRF route import kar sakta hai. Woh sirf route ko unique banata hai.</li>
<li>RD PE ke VRF ke liye local hai. Customer ke saare PEs par same ho sakta hai (simple) ya har PE par alag (load sharing aur fast convergence ke liye behtar, kyunki tab RR saare paths rakhta hai).</li>
<li>Apna ASN use karo (ya lab mein 64512 se 65534 range ka private).</li>
</ul>

<h3>Route target (RT): policy</h3>
<p><b>RT</b> VPNv4 route ke saath juda BGP <b>extended community</b> hai. Configuration do tarah ki:</p>
<dl class="terms">
<dt>export route-target</dt><dd>VRF jo bhi route VPNv4 mein advertise karta hai usme jodta hai.</dd>
<dt>import route-target</dt><dd>VRF har woh VPNv4 route import karta hai jisme uska kam se kam ek import RT ho.</dd>
<dt>route-target both X</dt><dd>import X aur export X ka shorthand.</dd></dl>
@@D@@
<p>RTs extended communities hain, isliye BGP session ko <b>extended communities bhejni</b> padti hain (<code>send-community extended</code>, chapter 4). Nahi bheji to RT raaste mein gir jaata hai aur kuch import nahi hota.</p>

<h3>VRF configuration verify karna</h3>
<p>Dono PEs ko same RD aur RT ke saath configure karne ke baad lab ka real output:</p>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show vrf detail CUST_A
VRF CUST_A (VRF Id = 1); default RD 65000:1; default VPNID &lt;not set&gt;
  Interfaces:
    Gi0/1
Address family ipv4 unicast (Table ID = 0x1):
  Export VPN route-target communities
    <span class="hl">RT:65000:1</span>
  Import VPN route-target communities
    <span class="hl">RT:65000:1</span>
  No import route-map
  No export route-map</pre>
<p>Sections padho: <b>Export</b> list woh hai jo yeh VRF apne routes par lagata hai; <b>Import</b> list woh hai jo woh accept karega. Do sites ek doosre ko na dekh sakein to pehle PE1 ki Export list ko PE2 ki Import list se milao.</p>

<div class="eg"><p><b>Worked example.</b> PE1 CUST_A ke liye RT 65000:1 export karta hai. PE2 ka VRF RT 65000:99 import karta hai. Route PE2 par VPNv4 table mein aata hai par VRF mein copy nahi hota, kyunki 65000:99 route par hai hi nahi. Fix PE2 par 65000:1 import karna hai (yeh lab 2, fault 1 hai). RD badalne se madad nahi milti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Maanna ki same RD do sites ko ek doosre ko dikhata hai. Dono sides par alag RTs use karna. Ek hi PE par do alag customers ke liye ek RD reuse karna (VRF table alag ho sakti hai par VPNv4 prefixes collide karte hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> RD 8 bytes ka hai; VPNv4 address 12 bytes (8 RD + 4 IPv4). RTs extended communities hain. VRF ke ek se zyada import aur export RT ho sakte hain.</p></div>

<div class="scn"><h4>Site 2 ko kuch nahi dikhta</h4><p>Naya VPN provision hua aur site 2 site 1 tak nahi pahunch paya. Dono PEs par same RD tha. <code>show vrf detail</code> ne dikhaya ki PE1 65000:1 export karta hai aur PE2 65000:99 import karta hai, copy-paste ka typo. Import RT theek karne se route ek minute mein dikh gaya.</p><p><b>Lesson:</b> ek PE ka export doosre PE ke import se milao.</p></div>

<div class="iv"><p class="q">"Route distinguisher aur route target mein kya difference hai?"</p><p>RD prefix ke aage lagta hai taaki overlapping customer routes VPNv4 table mein unique ho jayein. RT ek extended community hai jo tay karta hai kaunse VRFs route import karein aur is tarah VPN topology define karta hai. RD import ya export ko influence nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF PE par alag routing aur forwarding table hai.</li>
<li>RD (8 bytes) VPNv4 prefixes ko unique banata hai; aur kuch control nahi karta.</li>
<li>RT (extended community) import aur export tay karta hai.</li>
<li>show vrf detail export aur import RTs list karta hai.</li>
<li>Har PE par har VRF ka unique RD RR ko saare paths rakhne deta hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`PE1 RT 65000:1 export karta hai aur PE2 use import karta hai; RD sirf route ko unique banata hai.`,`export RT`,`import route par laga RT match karta hai, RD nahi`))}};export{t as default};