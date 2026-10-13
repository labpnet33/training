var e={id:`static-default`,h:{en:`Static and default routes: Lab 1 step by step`,hi:`Static aur default routes: Lab 1 step by step`},body:{en:`
<p>A <b>static route</b> is a route you type by hand: "to reach this network, hand the packet to that neighbour". It is the simplest form of routing and still everywhere in real networks: at branch offices with one uplink, at the internet edge, on firewalls and in cloud route tables. In this chapter you will build Lab 1 completely: HQ, the branch router BR and the ISP.</p>

<h3>An analogy: a signpost you put up yourself</h3>
<p>A static route is a signpost nailed to a junction. It is cheap, it never changes its mind and everyone can read it. But if the road behind it is closed, the signpost keeps pointing there until someone walks out and changes it. That is the trade-off of static routing: <b>predictable and light, but not adaptive</b>.</p>

<h3>The syntax</h3>
<pre class="code"><span class="c">! ip route &lt;destination network&gt; &lt;subnet mask&gt; &lt;next hop IP | exit interface&gt; [AD]</span>
ip route 10.2.2.0 255.255.255.0 10.0.12.2
<span class="c">! default route: all zeros means "any destination, any mask"</span>
ip route 0.0.0.0 0.0.0.0 203.0.113.1</pre>
<dl class="terms">
<dt>Destination and mask</dt><dd>The network you want to reach, written with a dotted mask (not /24). The address must be the network address: 10.2.2.0, not 10.2.2.10.</dd>
<dt>Next hop</dt><dd>The IP address of the neighbouring router on a shared subnet. This is the recommended form on Ethernet.</dd>
<dt>Exit interface</dt><dd>You may name the outgoing interface instead. On point-to-point serial links this works well; on Ethernet the router must ARP for every destination and relies on proxy ARP, so prefer a next hop (or both: <code>ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/1 10.0.12.2</code>, a fully specified route).</dd>
<dt>AD (optional)</dt><dd>Leave it out and the route gets AD 1. Add a higher value to create a backup (floating) route, covered in the next chapter.</dd>
</dl>

<h3>The default route</h3>
<p>0.0.0.0 with mask 0.0.0.0 matches every destination with zero bits, so it is used only when nothing more specific exists. It appears as <b>S*</b> and sets the <b>gateway of last resort</b>. Branch and edge routers use it to say "anything I do not know, send upstream". The IPv6 equivalent is <code>ipv6 route ::/0 &lt;next hop&gt;</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab 1 routes needed on HQ and BR">
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="14">BR</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24 local</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24 local</text>
<rect x="460" y="20" width="160" height="50" rx="8" fill="#fde68a"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="540" y="60" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.0/24 local</text>
<line x1="180" y1="45" x2="240" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="460" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="160" height="44" rx="6" fill="#bbf7d0"/><text x="100" y="127" text-anchor="middle" class="svg-ink" font-size="12">0/0 via 10.0.12.1</text>
<rect x="240" y="100" width="160" height="44" rx="6" fill="#bbf7d0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">10.2.2.0/24 via .12.2</text><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">0/0 via 203.0.113.1</text>
<rect x="460" y="100" width="160" height="44" rx="6" fill="#e2e8f0"/><text x="540" y="127" text-anchor="middle" class="svg-ink" font-size="12">10/8 via 203.0.113.2</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Green: you add. Grey: already on the ISP.</text>
</svg><p class="cap">Three static routes are enough: HQ learns the branch and the internet, BR sends everything to HQ.</p></div>

<h3>Lab 1 walkthrough</h3>
<p><b>Starting state.</b> Every interface is addressed, so each router knows only its connected networks. The ISP already has <code>ip route 10.0.0.0 255.0.0.0 203.0.113.2</code>, a route back to all of HQ's private space.</p>
<p><b>Task 1: HQ learns the branch LAN.</b></p>
<pre class="code"><span class="c">! on HQ</span>
enable
configure terminal
ip route 10.2.2.0 255.255.255.0 10.0.12.2</pre>
<p><b>Task 2: HQ sends everything else to the ISP.</b></p>
<pre class="code">ip route 0.0.0.0 0.0.0.0 203.0.113.1
end</pre>
<p><b>Task 3: BR sends everything that is not local to HQ.</b> The branch has one way out, so a single default route covers HQ's LAN, the internet and anything added later.</p>
<pre class="code"><span class="c">! on BR</span>
enable
configure terminal
ip route 0.0.0.0 0.0.0.0 10.0.12.1
end</pre>
<pre class="out">BR#show ip route
<span class="hl">Gateway of last resort is 10.0.12.1 to network 0.0.0.0</span>

S*    0.0.0.0/0 [1/0] via 10.0.12.1
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0
L        10.0.12.2/32 is directly connected, GigabitEthernet0/0
C        10.2.2.0/24 is directly connected, GigabitEthernet0/1
L        10.2.2.1/32 is directly connected, GigabitEthernet0/1</pre>
<p><b>Task 4: verify from PC-BR.</b> Ping PC-HQ, then trace to the internet server.</p>
<pre class="out">PC-BR&gt; ping 10.1.1.10
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

PC-BR&gt; trace 8.8.8.8
Type escape sequence to abort.
Tracing the route to 8.8.8.8
  1 10.2.2.1 1 msec 2 msec 1 msec
  2 10.0.12.1 2 msec 3 msec 2 msec
  3 203.0.113.1 3 msec 4 msec 3 msec
<span class="hl">  4 8.8.8.8 4 msec 5 msec 4 msec</span></pre>
<p>Each line is one router that replied: BR, HQ, the ISP, then the server. <b>Task 5</b> asks the default AD of a static route: <b>1</b>, visible as [1/0].</p>

<div class="eg"><p><b>Worked example: why the return path works.</b> The echo reply from 8.8.8.8 goes to 10.2.2.10. The ISP matches 10.0.0.0/8 and sends it to HQ. HQ matches 10.2.2.0/24 (longer than its default route) and sends it to BR. BR has 10.2.2.0/24 connected. If you had forgotten Task 1, HQ would have matched only its default route and bounced the reply back to the ISP until TTL expired.</p></div>

<div class="note"><p><b>Real-world note.</b> In the lab the ISP routes private 10.x addresses back to you. A real ISP never would; private (RFC 1918) addresses are dropped on the internet. HQ would use PAT on its internet interface, which you will configure in the services module.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the host address instead of the network (<code>ip route 10.2.2.10 255.255.255.0 ...</code> is rejected as inconsistent), using a next hop that is not on a connected subnet, typing the prefix length instead of the mask, and adding routes on only one router so the reply has nowhere to go.</p></div>

<div class="exam"><p><b>Exam trap.</b> A stub site with one uplink needs only a default route, not a list of every remote network. And the device at the far end still needs a specific route back to the stub site's LAN.</p></div>

<div class="scn"><h4>The new VLAN nobody could reach</h4><p>HQ added a voice VLAN 10.1.5.0/24 on its core switch. HQ users could call each other, but the branch phones could not register with the call server in that VLAN. A trace from BR stopped at HQ's router. The HQ router had no route to 10.1.5.0/24, because the new subnet sat behind the core switch rather than on a router interface. Adding <code>ip route 10.1.5.0 255.255.255.0</code> toward the core switch fixed it. BR needed nothing, because its default route already covered the new subnet.</p><p><b>Lesson:</b> default routes scale themselves; specific static routes must be updated every time the network grows.</p></div>

<div class="iv"><p class="q">"When would you choose static routing over a dynamic protocol?"</p><p>Strong answer: small or stub networks with a single path, internet edge default routes, routes pointing at a firewall or a provider that does not run your IGP, and security-sensitive links where you do not want to exchange routing information. Then state the cost: no automatic failover, manual updates as the network grows, and human errors that do not self-correct. Mention floating static routes as the classic way to add a backup.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip route network mask next-hop</code> creates a static route with AD 1.</li>
<li><code>ip route 0.0.0.0 0.0.0.0 next-hop</code> creates the default route and sets the gateway of last resort.</li>
<li>Prefer a next-hop IP on Ethernet; exit-interface-only routes rely on proxy ARP.</li>
<li>Every router on the path needs routes in both directions; stub sites need only a default route.</li>
<li>Verify with <code>show ip route</code>, ping and traceroute from the hosts.</li>
</ul></div>
`,hi:`
<p><b>Static route</b> woh route hai jo aap haath se type karte ho: "is network tak pahunchne ke liye packet us padosi ko do". Yeh routing ka sabse simple form hai aur real networks mein abhi bhi har jagah hai: ek uplink wale branch offices mein, internet edge par, firewalls par aur cloud route tables mein. Is chapter mein aap Lab 1 poora banaoge: HQ, branch router BR aur ISP.</p>

<h3>Ek analogy: signpost jo aap khud lagate ho</h3>
<p>Static route ek chauraahe par thoka hua signpost hai. Yeh sasta hai, kabhi apna mann nahi badalta aur har koi ise padh sakta hai. Lekin agar uske peeche ki sadak band ho jaaye, to signpost wahi ishaara karta rehta hai jab tak koi jaa kar use badal na de. Yahi static routing ka trade-off hai: <b>predictable aur halka, lekin adaptive nahi</b>.</p>

<h3>Syntax</h3>
<pre class="code"><span class="c">! ip route &lt;destination network&gt; &lt;subnet mask&gt; &lt;next hop IP | exit interface&gt; [AD]</span>
ip route 10.2.2.0 255.255.255.0 10.0.12.2
<span class="c">! default route: saare zeros matlab "koi bhi destination, koi bhi mask"</span>
ip route 0.0.0.0 0.0.0.0 203.0.113.1</pre>
<dl class="terms">
<dt>Destination aur mask</dt><dd>Woh network jahan pahunchna hai, dotted mask ke saath likha (/24 nahi). Address network address hona chahiye: 10.2.2.0, 10.2.2.10 nahi.</dd>
<dt>Next hop</dt><dd>Shared subnet par padosi router ka IP address. Ethernet par yahi recommended form hai.</dd>
<dt>Exit interface</dt><dd>Aap iske bajaye outgoing interface ka naam de sakte ho. Point-to-point serial links par yeh achha chalta hai; Ethernet par router ko har destination ke liye ARP karna padta hai aur woh proxy ARP par depend karta hai, isliye next hop prefer karo (ya dono: <code>ip route 10.2.2.0 255.255.255.0 GigabitEthernet0/1 10.0.12.2</code>, ek fully specified route).</dd>
<dt>AD (optional)</dt><dd>Chhod do to route ko AD 1 milti hai. Backup (floating) route banane ke liye zyada value do, jo agle chapter mein hai.</dd>
</dl>

<h3>Default route</h3>
<p>0.0.0.0 mask 0.0.0.0 ke saath zero bits se har destination match karta hai, isliye yeh tabhi use hota hai jab kuch aur specific na ho. Yeh <b>S*</b> ki tarah dikhta hai aur <b>gateway of last resort</b> set karta hai. Branch aur edge routers ise "jo mujhe nahi pata, upar bhej do" kehne ke liye use karte hain. IPv6 mein iska equivalent <code>ipv6 route ::/0 &lt;next hop&gt;</code> hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab 1 mein HQ aur BR par chahiye routes">
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="14">BR</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.0/24 local</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24 local</text>
<rect x="460" y="20" width="160" height="50" rx="8" fill="#fde68a"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="540" y="60" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.0/24 local</text>
<line x1="180" y1="45" x2="240" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="460" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="160" height="44" rx="6" fill="#bbf7d0"/><text x="100" y="127" text-anchor="middle" class="svg-ink" font-size="12">0/0 via 10.0.12.1</text>
<rect x="240" y="100" width="160" height="44" rx="6" fill="#bbf7d0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="12">10.2.2.0/24 via .12.2</text><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">0/0 via 203.0.113.1</text>
<rect x="460" y="100" width="160" height="44" rx="6" fill="#e2e8f0"/><text x="540" y="127" text-anchor="middle" class="svg-ink" font-size="12">10/8 via 203.0.113.2</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Green: aap add karte ho. Grey: ISP par pehle se.</text>
</svg><p class="cap">Teen static routes kaafi hain: HQ branch aur internet seekhta hai, BR sab kuch HQ ko bhejta hai.</p></div>

<h3>Lab 1 walkthrough</h3>
<p><b>Starting state.</b> Har interface addressed hai, isliye har router ko sirf apne connected networks pata hain. ISP par pehle se <code>ip route 10.0.0.0 255.0.0.0 203.0.113.2</code> hai, HQ ki saari private space ka wapas ka route.</p>
<p><b>Task 1: HQ branch LAN seekhta hai.</b></p>
<pre class="code"><span class="c">! HQ par</span>
enable
configure terminal
ip route 10.2.2.0 255.255.255.0 10.0.12.2</pre>
<p><b>Task 2: HQ baaki sab ISP ko bhejta hai.</b></p>
<pre class="code">ip route 0.0.0.0 0.0.0.0 203.0.113.1
end</pre>
<p><b>Task 3: BR jo local nahi hai woh sab HQ ko bhejta hai.</b> Branch ke paas bahar jaane ka ek hi raasta hai, isliye ek default route HQ ka LAN, internet aur baad mein add hone wali har cheez cover kar leta hai.</p>
<pre class="code"><span class="c">! BR par</span>
enable
configure terminal
ip route 0.0.0.0 0.0.0.0 10.0.12.1
end</pre>
<pre class="out">BR#show ip route
<span class="hl">Gateway of last resort is 10.0.12.1 to network 0.0.0.0</span>

S*    0.0.0.0/0 [1/0] via 10.0.12.1
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0
L        10.0.12.2/32 is directly connected, GigabitEthernet0/0
C        10.2.2.0/24 is directly connected, GigabitEthernet0/1
L        10.2.2.1/32 is directly connected, GigabitEthernet0/1</pre>
<p><b>Task 4: PC-BR se verify karo.</b> PC-HQ ko ping karo, phir internet server tak trace karo.</p>
<pre class="out">PC-BR&gt; ping 10.1.1.10
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

PC-BR&gt; trace 8.8.8.8
Type escape sequence to abort.
Tracing the route to 8.8.8.8
  1 10.2.2.1 1 msec 2 msec 1 msec
  2 10.0.12.1 2 msec 3 msec 2 msec
  3 203.0.113.1 3 msec 4 msec 3 msec
<span class="hl">  4 8.8.8.8 4 msec 5 msec 4 msec</span></pre>
<p>Har line ek router hai jisne reply kiya: BR, HQ, ISP, phir server. <b>Task 5</b> static route ki default AD poochta hai: <b>1</b>, jo [1/0] mein dikhti hai.</p>

<div class="eg"><p><b>Worked example: return path kyun kaam karta hai.</b> 8.8.8.8 se echo reply 10.2.2.10 ko jaata hai. ISP 10.0.0.0/8 match karta hai aur use HQ ko bhejta hai. HQ 10.2.2.0/24 match karta hai (apne default route se lamba) aur BR ko bhejta hai. BR par 10.2.2.0/24 connected hai. Agar aap Task 1 bhool jaate, to HQ sirf apna default route match karta aur reply ko ISP par wapas uchhaalta rehta jab tak TTL expire na ho jaata.</p></div>

<div class="note"><p><b>Real-world note.</b> Lab mein ISP private 10.x addresses ko aapki taraf wapas route karta hai. Real ISP kabhi nahi karega; private (RFC 1918) addresses internet par drop ho jaate hain. HQ apne internet interface par PAT use karega, jo aap services module mein configure karoge.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Network ki jagah host address likhna (<code>ip route 10.2.2.10 255.255.255.0 ...</code> inconsistent kehkar reject hota hai), aisa next hop use karna jo connected subnet par nahi hai, mask ki jagah prefix length type karna, aur sirf ek router par routes add karna jisse reply ke paas jaane ki jagah nahi bachti.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek uplink wali stub site ko sirf default route chahiye, har remote network ki list nahi. Aur door wale device ko abhi bhi stub site ke LAN ka specific wapas route chahiye.</p></div>

<div class="scn"><h4>Naya VLAN jahan koi nahi pahunch paaya</h4><p>HQ ne apne core switch par voice VLAN 10.1.5.0/24 add kiya. HQ users ek doosre ko call kar paa rahe the, lekin branch phones us VLAN ke call server se register nahi ho paa rahe the. BR se trace HQ ke router par ruk gaya. HQ router ke paas 10.1.5.0/24 ka koi route nahi tha, kyunki naya subnet router interface par nahi balki core switch ke peeche tha. Core switch ki taraf <code>ip route 10.1.5.0 255.255.255.0</code> add karne se theek ho gaya. BR ko kuch nahi chahiye tha, kyunki uska default route pehle se naya subnet cover karta tha.</p><p><b>Seekh:</b> default routes apne aap scale hote hain; specific static routes ko network badhne par har baar update karna padta hai.</p></div>

<div class="iv"><p class="q">"Dynamic protocol ki jagah static routing kab chunoge?"</p><p>Strong answer: chhote ya stub networks jinka ek hi path hai, internet edge default routes, firewall ya provider ki taraf routes jo aapka IGP nahi chalate, aur security-sensitive links jahan aap routing information exchange nahi karna chahte. Phir cost batao: automatic failover nahi, network badhne par manual updates, aur insaani galtiyan jo khud theek nahi hoti. Backup add karne ke classic tareeke ki tarah floating static routes ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip route network mask next-hop</code> AD 1 wala static route banata hai.</li>
<li><code>ip route 0.0.0.0 0.0.0.0 next-hop</code> default route banata hai aur gateway of last resort set karta hai.</li>
<li>Ethernet par next-hop IP prefer karo; sirf exit-interface wale routes proxy ARP par depend karte hain.</li>
<li>Path ke har router ko dono directions mein routes chahiye; stub sites ko sirf default route chahiye.</li>
<li><code>show ip route</code>, ping aur hosts se traceroute se verify karo.</li>
</ul></div>
`}};export{e as default};