var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PE interfaces in VRF and global"><rect x="200" y="20" width="240" height="120" rx="12" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="215" y="55" width="100" height="70" rx="8" fill="#fde68a"/><text x="265" y="78" text-anchor="middle" class="svg-ink" font-size="12">VRF CUST_A</text><text x="265" y="98" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1</text><text x="265" y="114" text-anchor="middle" class="svg-muted" font-size="11">192.168.1.1/24</text><rect x="325" y="55" width="100" height="70" rx="8" fill="#ddd6fe"/><text x="375" y="78" text-anchor="middle" class="svg-ink" font-size="12">Global table</text><text x="375" y="98" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0, Lo0</text><text x="375" y="114" text-anchor="middle" class="svg-muted" font-size="11">IS-IS, LDP</text><line x1="60" y1="90" x2="215" y2="90" stroke="#64748b" stroke-width="2"/><line x1="425" y1="90" x2="580" y2="90" stroke="#64748b" stroke-width="2"/><text x="130" y="82" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="505" y="82" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`pe-vrf-interfaces`,h:{en:`Building the VRF on the PE: interfaces, addresses and tests`,hi:`PE par VRF banana: interfaces, addresses aur tests`},body:{en:`
<p>This is lab 1, tasks 1 and 2. You create the VRF on both PEs and move the CE-facing interface into it. The order of the commands matters, and so does the way you test: the <i>global</i> ping and routing table will not show the customer.</p>

<h3>Step 1: define the VRF</h3>
<pre class="code"><span class="c">! On PE1 and PE2 (lab solution)</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
 exit-address-family</pre>
<p>This creates the table and the policy but no interface belongs to it yet. Compare with chapter 2.</p>

<h3>Step 2: put the interface in the VRF</h3>
<pre class="code"><span class="c">! PE1</span>
interface GigabitEthernet0/1
 vrf forwarding CUST_A
 ip address 192.168.1.1 255.255.255.0
<span class="c">! PE2</span>
interface GigabitEthernet0/1
 vrf forwarding CUST_A
 ip address 192.168.2.1 255.255.255.0</pre>
<div class="warn"><p><b>Order matters.</b> When you type <code>vrf forwarding</code>, IOS removes any existing IP address from the interface (it prints an informational message on real routers). You must <b>configure the IP address again</b> after the vrf command. The most common reason a new VRF interface "does not work" is a missing address, or an address typed before vrf forwarding.</p></div>

<h3>Step 3: verify the interface and the table</h3>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show ip route vrf CUST_A
Routing Table: CUST_A
Gateway of last resort is not set
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1
L        192.168.1.1/32 is directly connected, GigabitEthernet0/1

PE1# ping vrf CUST_A 192.168.1.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.2, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5)</pre>
<p>Three details. (1) <code>show ip route vrf CUST_A</code> has its own table: the connected network and the local /32 are there. (2) The first ping packet is dropped (the dot) while the router resolves ARP, so 80 percent success is normal for the first test; run it again and you see 100 percent. (3) You <b>must</b> use <code>ping vrf CUST_A</code>: a plain <code>ping 192.168.1.2</code> uses the global table and fails.</p>
@@D@@

<h3>The two tables stay separate</h3>
<p>The lab check also requires that the customer subnet is <b>not</b> in the global table:</p>
<pre class="code"><span class="c">! reference: the global table on PE1 lists only IS-IS routes, Loopback0 and core links</span></pre>
<p>Only core routes (IS-IS, loopbacks, links). No 192.168.1.0/24, no 172.16.x.x. The core and the customer are separate. This is exactly why the P router never sees customer prefixes.</p>

<h3>Useful VRF commands</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Which interfaces are in which VRF</td><td><code>show vrf</code></td></tr>
<tr><td>RD and RTs of a VRF</td><td><code>show vrf detail CUST_A</code></td></tr>
<tr><td>Routing table of a VRF</td><td><code>show ip route vrf CUST_A</code></td></tr>
<tr><td>Ping or traceroute inside a VRF</td><td><code>ping vrf CUST_A x.x.x.x</code>, <code>traceroute vrf CUST_A x.x.x.x</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> An engineer pastes the interface config in the order <code>ip address 192.168.1.1 255.255.255.0</code> then <code>vrf forwarding CUST_A</code>. Result: the interface is in the VRF but has no address; <code>show ip route vrf CUST_A</code> is empty. Reordering (vrf first, address second) restores the connected route and the ping.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using global ping or <code>show ip route</code> to test a customer link. Forgetting that the interface address disappears when the VRF is applied. Placing the core-facing interface in the VRF by mistake: that breaks IS-IS and LDP.</p></div>
<div class="exam"><p><b>Exam trap.</b> The old syntax <code>ip vrf</code> and <code>ip vrf forwarding</code> still exists on older IOS; <code>vrf definition</code> and <code>vrf forwarding</code> are the multi-protocol (IPv4 and IPv6) forms used here. The VRF interface address must be configured <i>after</i> the VRF.</p></div>

<div class="scn"><h4>Interface up, no ping</h4><p>After migrating a branch, the CE could not ping its PE. The interface was up/up and the VRF showed it, but the PE had no connected route in the VRF. The engineer had applied <code>vrf forwarding</code> after the address, which wiped the address. Re-entering the address restored everything.</p><p><b>Lesson:</b> after any VRF change on an interface, check the address again.</p></div>

<div class="iv"><p class="q">"How do you test connectivity from a PE to a customer CE?"</p><p>Use ping vrf NAME CE-address, because a plain ping uses the global routing table. I also check show ip route vrf NAME for the connected route and show vrf to confirm the interface belongs to the VRF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define the VRF, then vrf forwarding on the interface, then the IP address.</li>
<li>vrf forwarding removes the address; always re-enter it.</li>
<li>Test with ping vrf NAME and show ip route vrf NAME.</li>
<li>The first ping often drops one packet because of ARP.</li>
<li>Customer prefixes never appear in the global table.</li>
</ul></div>
`.replace(`@@D@@`,e(`Customer-facing interface in the VRF; core interfaces stay in the global table.`,`CE1 side`,`core: P router`)),hi:`
<p>Yeh lab 1 ke tasks 1 aur 2 hain. Aap dono PEs par VRF banate ho aur CE-facing interface ko usme daalte ho. Commands ka order matter karta hai, aur test karne ka tareeka bhi: <i>global</i> ping aur routing table customer ko nahi dikhayenge.</p>

<h3>Step 1: VRF define karo</h3>
<pre class="code"><span class="c">! PE1 aur PE2 par (lab solution)</span>
vrf definition CUST_A
 rd 65000:1
 address-family ipv4
  route-target both 65000:1
 exit-address-family</pre>
<p>Yeh table aur policy banata hai par abhi koi interface uska nahi. Chapter 2 se compare karo.</p>

<h3>Step 2: interface ko VRF mein daalo</h3>
<pre class="code"><span class="c">! PE1</span>
interface GigabitEthernet0/1
 vrf forwarding CUST_A
 ip address 192.168.1.1 255.255.255.0
<span class="c">! PE2</span>
interface GigabitEthernet0/1
 vrf forwarding CUST_A
 ip address 192.168.2.1 255.255.255.0</pre>
<div class="warn"><p><b>Order matters.</b> Jab aap <code>vrf forwarding</code> type karte ho, IOS interface se koi bhi existing IP address hata deta hai (real routers par informational message print karta hai). Aapko vrf command ke baad <b>IP address dobara configure</b> karna padta hai. Naye VRF interface ke "kaam na karne" ki sabse aam wajah missing address hai, ya vrf forwarding se pehle likha address.</p></div>

<h3>Step 3: interface aur table verify karo</h3>
<pre class="out">PE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  CUST_A                           65000:1               ipv4        Gi0/1

PE1# show ip route vrf CUST_A
Routing Table: CUST_A
Gateway of last resort is not set
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1
L        192.168.1.1/32 is directly connected, GigabitEthernet0/1

PE1# ping vrf CUST_A 192.168.1.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.1.2, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5)</pre>
<p>Teen details. (1) <code>show ip route vrf CUST_A</code> ki apni table hai: connected network aur local /32 wahan hain. (2) Pehla ping packet drop hota hai (dot) jab router ARP resolve karta hai, isliye pehle test mein 80 percent success normal hai; dobara chalao to 100 percent dikhega. (3) Aapko <code>ping vrf CUST_A</code> <b>hi</b> use karna hai: plain <code>ping 192.168.1.2</code> global table use karta hai aur fail hota hai.</p>
@@D@@

<h3>Dono tables alag rehti hain</h3>
<p>Lab check yeh bhi maangta hai ki customer subnet global table mein <b>nahi</b> hai:</p>
<pre class="code"><span class="c">! reference: the global table on PE1 lists only IS-IS routes, Loopback0 and core links</span></pre>
<p>Sirf core routes (IS-IS, loopbacks, links). 192.168.1.0/24 nahi, 172.16.x.x nahi. Core aur customer alag hain. Isi wajah se P router customer prefixes kabhi nahi dekhta.</p>

<h3>Kaam ke VRF commands</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Kaunsa interface kaunse VRF mein hai</td><td><code>show vrf</code></td></tr>
<tr><td>VRF ka RD aur RTs</td><td><code>show vrf detail CUST_A</code></td></tr>
<tr><td>VRF ki routing table</td><td><code>show ip route vrf CUST_A</code></td></tr>
<tr><td>VRF ke andar ping ya traceroute</td><td><code>ping vrf CUST_A x.x.x.x</code>, <code>traceroute vrf CUST_A x.x.x.x</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> Engineer interface config order mein paste karta hai <code>ip address 192.168.1.1 255.255.255.0</code> phir <code>vrf forwarding CUST_A</code>. Natija: interface VRF mein hai par address nahi; <code>show ip route vrf CUST_A</code> khaali. Order badalne (pehle vrf, phir address) se connected route aur ping wapas aa jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Customer link test karne ke liye global ping ya <code>show ip route</code> use karna. Bhoolna ki VRF lagane par interface ka address chala jaata hai. Core-facing interface ko galti se VRF mein daalna: isse IS-IS aur LDP toot jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Purana syntax <code>ip vrf</code> aur <code>ip vrf forwarding</code> purane IOS par ab bhi hai; <code>vrf definition</code> aur <code>vrf forwarding</code> multi-protocol (IPv4 aur IPv6) forms hain jo yahan use hue. VRF interface ka address VRF ke <i>baad</i> configure hona chahiye.</p></div>

<div class="scn"><h4>Interface up, ping nahi</h4><p>Branch migrate karne ke baad CE apne PE ko ping nahi kar paya. Interface up/up tha aur VRF ne use dikhaya, par PE ke paas VRF mein connected route nahi tha. Engineer ne <code>vrf forwarding</code> address ke baad lagaya tha, jisse address mit gaya. Address dobara dalne se sab theek ho gaya.</p><p><b>Lesson:</b> interface par kisi bhi VRF change ke baad address dobara check karo.</p></div>

<div class="iv"><p class="q">"PE se customer CE tak connectivity kaise test karte ho?"</p><p>ping vrf NAME CE-address use karta hoon, kyunki plain ping global routing table use karta hai. Saath mein connected route ke liye show ip route vrf NAME aur show vrf se confirm karta hoon ki interface VRF ka hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF define karo, phir interface par vrf forwarding, phir IP address.</li>
<li>vrf forwarding address hata deta hai; hamesha dobara daalo.</li>
<li>ping vrf NAME aur show ip route vrf NAME se test karo.</li>
<li>Pehla ping aksar ARP ki wajah se ek packet drop karta hai.</li>
<li>Customer prefixes global table mein kabhi nahi aate.</li>
</ul></div>
`.replace(`@@D@@`,e(`Customer-facing interface VRF mein; core interfaces global table mein rehte hain.`,`CE1 side`,`core: P router`))}};export{t as default};