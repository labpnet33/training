var e={id:`ip-pools`,h:{en:`IP pools: choosing the public addresses users leave with`,hi:`IP pools: users kaunse public addresses se bahar jaayein yeh chunna`},body:{en:`
<p>With plain <code>nat enable</code> every user leaves as the FortiGate WAN address. Sometimes that is not what the business wants. The ISP may have given you a block of addresses, a partner may allow only a certain source range, or security may want user traffic separated from the firewall's own address. An <b>IP pool</b> is a named range of public addresses that a policy can use as the translated source. Think of it as a set of outgoing phone numbers instead of just the main line.</p>

<h3>The lab story</h3>
<p>The ISP gave Pune the block 203.0.113.0/29. Security wants user traffic to leave from 203.0.113.5 to 203.0.113.6, so that 203.0.113.2 stays for management and VPNs. Before the change the session table shows the old behaviour:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>

<h3>Create the pool and use it</h3>
<pre class="code">config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end
config firewall policy
    edit 1
        set ippool enable
        set poolname "NAT-POOL"
    next
end</pre>
<pre class="out">FGT1 # show firewall ippool
config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end

FGT1 # get firewall ippool
== [ NAT-POOL ]
name: NAT-POOL   type: overload   startip: 203.0.113.5</pre>
<p>Notice that <code>get</code> reveals the default pool type: <b>overload</b>. The policy keeps <code>nat enable</code>; the pool only chooses which address is used. After the change, new sessions use the pool:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       203.0.113.2:60001     8.8.8.8:80            -
tcp     3600   10.0.1.10:57160       <span class="hl">203.0.113.5:60002</span>     8.8.8.8:80            -</pre>
<p>Two things to learn. First, the new session uses <b>203.0.113.5</b>. Second, the old session (the first line) still shows 203.0.113.2: a translation belongs to its session and only <b>new</b> sessions use the new rule. The old one disappears when it expires.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pool types">
<rect x="10" y="15" width="150" height="160" rx="10" fill="#bae6fd"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">overload</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="11">many hosts : few IPs</text><text x="85" y="80" text-anchor="middle" class="svg-muted" font-size="11">ports are shared</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">default type</text>
<rect x="170" y="15" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="245" y="40" text-anchor="middle" class="svg-ink" font-size="13">one-to-one</text><text x="245" y="62" text-anchor="middle" class="svg-muted" font-size="11">1 host : 1 public IP</text><text x="245" y="80" text-anchor="middle" class="svg-muted" font-size="11">no port change</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="11">pool size limits hosts</text>
<rect x="330" y="15" width="150" height="160" rx="10" fill="#ddd6fe"/><text x="405" y="40" text-anchor="middle" class="svg-ink" font-size="13">fixed port range</text><text x="405" y="62" text-anchor="middle" class="svg-muted" font-size="11">each host gets a</text><text x="405" y="80" text-anchor="middle" class="svg-muted" font-size="11">fixed IP and port range</text><text x="405" y="100" text-anchor="middle" class="svg-muted" font-size="11">predictable logs</text>
<rect x="490" y="15" width="140" height="160" rx="10" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">port block alloc.</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="11">hosts get blocks</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="11">of ports, one log</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">per block</text>
</svg><p class="cap">Four pool types. Overload and one-to-one are available in the simulator; the other two are reference only.</p></div>

<h3>Pool types</h3>
<table class="cmp"><tr><th>Type</th><th>Behaviour</th><th>Typical use</th></tr>
<tr><td><code>overload</code> (default)</td><td>Many internal hosts share the pool addresses with port translation</td><td>Normal user internet access</td></tr>
<tr><td><code>one-to-one</code></td><td>Each internal host takes one public address; the port is not changed</td><td>A few hosts that must keep a fixed public identity</td></tr>
<tr><td><code>fixed-port-range</code></td><td>An internal range is mapped to an external range, with fixed port ranges per host</td><td>Predictable mapping for logging or partners</td></tr>
<tr><td><code>port-block-allocation</code></td><td>Blocks of ports are handed out per host</td><td>Carrier-style address sharing with compact logging</td></tr></table>
<p>One-to-one works in the simulator:</p>
<pre class="code">config firewall ippool
    edit "ONE2ONE"
        set type one-to-one
        set startip 203.0.113.7
        set endip 203.0.113.7
    next
end</pre>
<p>For the other two types, the lab simulator does not provide them, so the next block is a reference configuration (not run in the simulator). The names below match FortiOS 7.x; check them with <code>?</code> on a real unit:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall ippool
    edit "FIXED-RANGE"
        set type fixed-port-range
        set startip 203.0.113.5
        set endip 203.0.113.5
        set source-startip 10.0.1.1
        set source-endip 10.0.1.254
    next
    edit "PBA-POOL"
        set type port-block-allocation
        set startip 203.0.113.6
        set endip 203.0.113.6
        set block-size 128
        set num-blocks-per-user 8
    next
end</pre>

<h3>Why the ISP can reach pool addresses: ARP</h3>
<p>If the pool addresses sit in the same subnet as the WAN interface, the ISP router will ARP for them. The FortiGate answers these ARP requests for pool addresses (<code>arp-reply</code> is enabled by default). On the ISP router in the lab you can see it:</p>
<pre class="out">ISP# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  203.0.113.1      -          5254.cae3.d301  ARPA   GigabitEthernet0/0
Internet  203.0.113.2      0          5254.7c9f.fb01  ARPA   GigabitEthernet0/0
Internet  <span class="hl">203.0.113.5</span>      0          <span class="hl">5254.7c9f.fb01</span>  ARPA   GigabitEthernet0/0</pre>
<p>203.0.113.5 resolves to the <b>same MAC address</b> as 203.0.113.2: the FortiGate port1. If pool addresses were outside the WAN subnet, the ISP would have to route them to the FortiGate, or replies would never come back.</p>

<div class="eg"><p><b>Worked example.</b> A partner permits only 203.0.113.5 and 203.0.113.6 to reach its API. You create NAT-POOL with that range and attach it to the policy used by the finance subnet. Finance sessions leave from those two addresses; other staff still use 203.0.113.2 through a second policy without the pool. The partner firewall sees only the two permitted addresses.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Creating the pool but forgetting <code>set ippool enable</code> and <code>set poolname</code> in the policy; turning off <code>nat</code> in the policy (the pool needs NAT enabled); using pool addresses the ISP does not route to you; expecting existing sessions to move to the pool at once; a one-to-one pool smaller than the number of hosts, so extra hosts fail.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default pool type is <b>overload</b>, and the pool replaces the <i>source</i> address only. A pool is not used for inbound publishing; for that you need a VIP. And a pool is applied by name in the policy, not by the interface.</p></div>

<div class="scn"><h4>Customer whitelists three addresses</h4><p>A bank customer allowed API calls only from three listed addresses. The company created an overload pool with exactly those three and attached it to the application server policy. The first test failed, because the pool was attached to the wrong policy (a general one below a more specific one). After moving the pool to the policy that actually matched, the logs showed the three addresses and the customer's calls succeeded.</p><p><b>Lesson:</b> a pool belongs to one policy. Use the policy lookup to know which policy your traffic hits.</p></div>

<div class="iv"><p class="q">"How do you make users leave a FortiGate with a specific range of public addresses?"</p><p>Create an IP pool with the range (<code>config firewall ippool</code>), then in the policy that matches the traffic set <code>nat enable</code>, <code>ippool enable</code> and <code>poolname</code>. Mention the pool types, ARP replies for pool addresses, and that only new sessions use the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An IP pool is a named range of translated source addresses used by a policy.</li>
<li>Policy needs <code>nat enable</code>, <code>ippool enable</code> and <code>poolname</code>.</li>
<li>Types: overload (default), one-to-one, fixed-port-range, port-block-allocation.</li>
<li>The FortiGate answers ARP for pool addresses on the connected WAN subnet.</li>
<li>Only new sessions use a changed pool; existing sessions keep their old translation.</li>
</ul></div>
`,hi:`
<p>Sirf <code>nat enable</code> ke saath har user FortiGate ke WAN address ke roop mein nikalta hai. Kabhi business yeh nahi chahta. ISP ne addresses ka block diya ho sakta hai, partner sirf ek certain source range allow karta ho, ya security chahti ho ki user traffic firewall ke apne address se alag rahe. <b>IP pool</b> public addresses ki named range hai jise policy translated source ke roop mein use kar sakti hai. Ise sirf main line ki jagah outgoing phone numbers ke set ki tarah socho.</p>

<h3>Lab ki kahani</h3>
<p>ISP ne Pune ko block 203.0.113.0/29 diya. Security chahti hai ki user traffic 203.0.113.5 se 203.0.113.6 se nikle, taaki 203.0.113.2 management aur VPNs ke liye rahe. Change se pehle session table purana behaviour dikhata hai:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>

<h3>Pool banao aur use karo</h3>
<pre class="code">config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end
config firewall policy
    edit 1
        set ippool enable
        set poolname "NAT-POOL"
    next
end</pre>
<pre class="out">FGT1 # show firewall ippool
config firewall ippool
    edit "NAT-POOL"
        set startip 203.0.113.5
        set endip 203.0.113.6
    next
end

FGT1 # get firewall ippool
== [ NAT-POOL ]
name: NAT-POOL   type: overload   startip: 203.0.113.5</pre>
<p>Dhyan do ki <code>get</code> default pool type dikhata hai: <b>overload</b>. Policy mein <code>nat enable</code> rehta hai; pool sirf yeh chunta hai ki kaunsa address use ho. Change ke baad naye sessions pool use karte hain:</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       203.0.113.2:60001     8.8.8.8:80            -
tcp     3600   10.0.1.10:57160       <span class="hl">203.0.113.5:60002</span>     8.8.8.8:80            -</pre>
<p>Do baatein seekho. Pehli, naya session <b>203.0.113.5</b> use karta hai. Doosri, purana session (pehli line) ab bhi 203.0.113.2 dikhata hai: translation apne session ki hoti hai aur sirf <b>naye</b> sessions naya rule use karte hain. Purana expire hone par gayab ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pool types">
<rect x="10" y="15" width="150" height="160" rx="10" fill="#bae6fd"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">overload</text><text x="85" y="62" text-anchor="middle" class="svg-muted" font-size="11">kai hosts : kam IPs</text><text x="85" y="80" text-anchor="middle" class="svg-muted" font-size="11">ports share hote hain</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">default type</text>
<rect x="170" y="15" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="245" y="40" text-anchor="middle" class="svg-ink" font-size="13">one-to-one</text><text x="245" y="62" text-anchor="middle" class="svg-muted" font-size="11">1 host : 1 public IP</text><text x="245" y="80" text-anchor="middle" class="svg-muted" font-size="11">port change nahi</text><text x="245" y="100" text-anchor="middle" class="svg-muted" font-size="11">pool size hosts limit karta hai</text>
<rect x="330" y="15" width="150" height="160" rx="10" fill="#ddd6fe"/><text x="405" y="40" text-anchor="middle" class="svg-ink" font-size="13">fixed port range</text><text x="405" y="62" text-anchor="middle" class="svg-muted" font-size="11">har host ko fixed IP</text><text x="405" y="80" text-anchor="middle" class="svg-muted" font-size="11">aur port range</text><text x="405" y="100" text-anchor="middle" class="svg-muted" font-size="11">predictable logs</text>
<rect x="490" y="15" width="140" height="160" rx="10" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">port block alloc.</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="11">hosts ko ports ke</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="11">blocks, har block</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">ka ek log</text>
</svg><p class="cap">Chaar pool types. Overload aur one-to-one simulator mein available hain; baaki do sirf reference hain.</p></div>

<h3>Pool types</h3>
<table class="cmp"><tr><th>Type</th><th>Behaviour</th><th>Typical use</th></tr>
<tr><td><code>overload</code> (default)</td><td>Kai internal hosts port translation ke saath pool addresses share karte hain</td><td>Normal user internet access</td></tr>
<tr><td><code>one-to-one</code></td><td>Har internal host ek public address leta hai; port change nahi hota</td><td>Kuch hosts jinhe fixed public identity chahiye</td></tr>
<tr><td><code>fixed-port-range</code></td><td>Internal range ko external range se map karta hai, har host ke fixed port ranges ke saath</td><td>Logging ya partners ke liye predictable mapping</td></tr>
<tr><td><code>port-block-allocation</code></td><td>Har host ko ports ke blocks diye jaate hain</td><td>Carrier-style address sharing, compact logging ke saath</td></tr></table>
<p>One-to-one simulator mein kaam karta hai:</p>
<pre class="code">config firewall ippool
    edit "ONE2ONE"
        set type one-to-one
        set startip 203.0.113.7
        set endip 203.0.113.7
    next
end</pre>
<p>Baaki do types lab simulator mein nahi hain, isliye agla block reference configuration hai (not run in the simulator). Neeche ke naam FortiOS 7.x se milte hain; real unit par <code>?</code> se check karo:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall ippool
    edit "FIXED-RANGE"
        set type fixed-port-range
        set startip 203.0.113.5
        set endip 203.0.113.5
        set source-startip 10.0.1.1
        set source-endip 10.0.1.254
    next
    edit "PBA-POOL"
        set type port-block-allocation
        set startip 203.0.113.6
        set endip 203.0.113.6
        set block-size 128
        set num-blocks-per-user 8
    next
end</pre>

<h3>ISP pool addresses tak kaise pahunchta hai: ARP</h3>
<p>Pool addresses WAN interface ke same subnet mein hon to ISP router unke liye ARP karta hai. FortiGate pool addresses ke ARP requests ka jawab deta hai (<code>arp-reply</code> default mein enabled hai). Lab mein ISP router par yeh dikhta hai:</p>
<pre class="out">ISP# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  203.0.113.1      -          5254.cae3.d301  ARPA   GigabitEthernet0/0
Internet  203.0.113.2      0          5254.7c9f.fb01  ARPA   GigabitEthernet0/0
Internet  <span class="hl">203.0.113.5</span>      0          <span class="hl">5254.7c9f.fb01</span>  ARPA   GigabitEthernet0/0</pre>
<p>203.0.113.5 <b>wahi MAC address</b> resolve karta hai jo 203.0.113.2 karta hai: FortiGate port1. Pool addresses WAN subnet ke bahar hon to ISP ko unhe FortiGate tak route karna padega, nahi to replies kabhi nahi aayenge.</p>

<div class="eg"><p><b>Worked example.</b> Ek partner apni API ko sirf 203.0.113.5 aur 203.0.113.6 se reach karne deta hai. Aap us range ke saath NAT-POOL banate ho aur use finance subnet ki policy se attach karte ho. Finance sessions un do addresses se nikalte hain; baaki staff pool ke bina doosri policy se 203.0.113.2 use karta hai. Partner firewall sirf do permitted addresses dekhta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Pool banana lekin policy mein <code>set ippool enable</code> aur <code>set poolname</code> bhool jaana; policy mein <code>nat</code> off karna (pool ko NAT enabled chahiye); aise pool addresses use karna jinhe ISP aapko route nahi karta; maujood sessions ke turant pool par shift hone ki ummeed; hosts se chhota one-to-one pool, jisse extra hosts fail ho jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default pool type <b>overload</b> hai, aur pool sirf <i>source</i> address replace karta hai. Pool inbound publishing ke liye use nahi hota; uske liye VIP chahiye. Aur pool policy mein naam se lagta hai, interface se nahi.</p></div>

<div class="scn"><h4>Customer teen addresses whitelist karta hai</h4><p>Ek bank customer ne API calls sirf teen listed addresses se allow ki. Company ne bilkul wahi teen ke saath overload pool banaya aur use application server policy se attach kiya. Pehla test fail hua, kyunki pool galat policy se attach tha (ek general policy jo zyada specific ke neeche thi). Pool ko us policy par move karne ke baad jo sach mein match ho rahi thi, logs mein teen addresses dikhe aur customer ki calls succeed hui.</p><p><b>Lesson:</b> pool ek policy ka hota hai. Policy lookup se pata karo ki aapka traffic kaunsi policy hit karta hai.</p></div>

<div class="iv"><p class="q">"Users ko FortiGate se public addresses ki specific range ke saath kaise nikaloge?"</p><p>Range ke saath IP pool banao (<code>config firewall ippool</code>), phir traffic match karne wali policy mein <code>nat enable</code>, <code>ippool enable</code> aur <code>poolname</code> set karo. Pool types, pool addresses ke liye ARP replies, aur yeh ki sirf naye sessions change use karte hain, inka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP pool translated source addresses ki named range hai jise policy use karti hai.</li>
<li>Policy ko <code>nat enable</code>, <code>ippool enable</code> aur <code>poolname</code> chahiye.</li>
<li>Types: overload (default), one-to-one, fixed-port-range, port-block-allocation.</li>
<li>Connected WAN subnet par FortiGate pool addresses ke liye ARP ka jawab deta hai.</li>
<li>Badla hua pool sirf naye sessions use karte hain; existing sessions purani translation rakhte hain.</li>
</ul></div>
`}};export{e as default};