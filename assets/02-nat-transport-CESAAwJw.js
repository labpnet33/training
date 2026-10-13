var e={id:`nat-transport`,h:{en:`Step 1: NAT on the transport interface`,hi:`Step 1: Transport interface par NAT`},body:{en:`
<p>Every DIA design starts with the same first step: make the transport interface capable of translating private branch addresses into its own public address. Without it, a packet from 10.1.10.10 would leave Pune with a private source address, and the internet would simply drop it or never answer. This chapter explains exactly what to configure, what the configuration does, and how to prove it is in place.</p>

<h3>Analogy: a block of flats with one postal address</h3>
<p>A big apartment block has hundreds of flats but one street address. Each resident writes their flat number on the letter; the building's reception puts the building's address on the envelope, remembers who sent what, and delivers the reply to the right flat. That reception is <b>NAT</b>. When many inside hosts share one outside address, and the reception tells them apart by port number, it is called <b>PAT</b> (port address translation) or <b>NAT overload</b>.</p>

<h3>NAT in three terms</h3>
<dl class="terms">
<dt>Inside local</dt><dd>The private address of the host as the branch sees it, for example 10.1.10.10.</dd>
<dt>Inside global</dt><dd>The public address that host appears as on the internet, for example the transport address 203.0.113.10.</dd>
<dt>Outside interface</dt><dd>The interface facing the internet: here the transport interface GigabitEthernet1 of E-BR1.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PAT on the E-BR1 transport interface">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="70" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="230" y="40" width="190" height="80" rx="8" fill="#bae6fd"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="14">E-BR1 (NAT)</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="12">Gi3 inside   Gi1 outside</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">overload on Gi1</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<line x1="130" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="3"/><text x="180" y="72" text-anchor="middle" class="svg-accent" font-size="11">src 10.1.10.10</text>
<line x1="420" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="3"/><text x="470" y="72" text-anchor="middle" class="svg-accent" font-size="11">src 203.0.113.10</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Many inside hosts, one outside address, told apart by port.</text>
</svg><p class="cap">PAT on the transport: the source address is rewritten as the packet leaves GigabitEthernet1.</p></div>

<h3>What to configure on an IOS XE WAN Edge</h3>
<p>DIA NAT needs two pieces of configuration on the WAN Edge, in the global (VPN 0) context:</p>
<pre class="code"><span class="c">! E-BR1, controller mode: use config-transaction and commit</span>
E-BR1# config-transaction
E-BR1(config)# interface GigabitEthernet1
E-BR1(config-if)# ip nat outside
E-BR1(config-if)# exit
E-BR1(config)# ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload
E-BR1(config)# commit</pre>
<ul>
<li><code>ip nat outside</code> marks the transport as the outside of the translation.</li>
<li><code>nat-dia-vpn-hop-access-list</code> is a <b>system-generated</b> list that matches traffic being handed from a service VPN to the transport for DIA. You do not write its entries; the edge fills it when DIA is active.</li>
<li><code>interface GigabitEthernet1 overload</code> means PAT: all hosts share the interface address and are separated by port.</li>
</ul>
<p>In SD-WAN Manager this is a toggle on the VPN 0 interface: in the <b>VPN Interface Ethernet</b> feature template (or the WAN interface feature of a configuration-group transport profile) you set <b>NAT</b> to On, choose <b>Interface</b> as the NAT type, and can adjust the UDP and TCP timeouts. The result is the same two lines.</p>

<div class="note"><p><b>Two different NATs.</b> This NAT translates <i>user</i> traffic leaving the branch for the internet. It is not the NAT that an upstream ISP router may apply to the edge's own tunnel traffic; the fabric handles that case automatically with the public IP and port learned during control connection setup. Do not confuse them in an exam question.</p></div>

<h3>What NAT does not do</h3>
<p><b>Turning NAT on does not send any user traffic out.</b> It only makes the interface usable as a DIA exit. User traffic still follows the VPN 10 routing table (for example, an OMP default route to the data center) until a NAT route or a data policy steers it to the transport. This is the single most important idea of this chapter.</p>
<p>NAT on the TLOC interface does not disturb the fabric either. Control connections (DTLS or TLS) and the BFD sessions inside IPsec are sourced by the router itself, from VPN 0, not from a service VPN, so the DIA rule does not match them.</p>

<h3>Prerequisites in VPN 0</h3>
<ul>
<li>The transport interface must have a <b>default route</b> to the ISP gateway in VPN 0 (in the lab <code>ip route 0.0.0.0 0.0.0.0 203.0.113.9</code>). The edge already needs this to reach the Validator, so it is normally there.</li>
<li>The color should be an internet-facing one such as <code>biz-internet</code>. An MPLS (private) transport has no path to the internet even with NAT.</li>
</ul>

<h3>Proving it is in place</h3>
<pre class="out">E-BR1# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
Outside interfaces:
  <span class="hl">GigabitEthernet1</span>
Inside interfaces:
  (none yet, DIA hands traffic from the service VPN internally)
Hits: 0  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list nat-dia-vpn-hop-access-list interface GigabitEthernet1 refcount 0

E-BR1# show running-config interface GigabitEthernet1
interface GigabitEthernet1
 ip address 203.0.113.10 255.255.255.252
 <span class="hl">ip nat outside</span>
 negotiation auto</pre>
<p>Zero translations is expected at this point: nothing steers traffic to the interface yet. What you check is that the transport is listed under <b>Outside interfaces</b> and that the dynamic mapping uses the interface address with overload.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail's E-BR1 has transport GigabitEthernet1 203.0.113.10/30 with the ISP gateway 203.0.113.9. After the two NAT lines are committed, a user ping to 8.8.8.8 still goes through Mumbai because the VPN 10 default route is learned by OMP from E-DC. Only after chapter 3 (the NAT route) or chapter 4 (a data policy) does STAFF-PC or GUEST-PC leave locally, and then <code>show ip nat translations</code> shows 10.1.10.10 translated to 203.0.113.10.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring the overload rule but forgetting <code>ip nat outside</code> on the transport (or the other way round); partial NAT is the number one cause of "DIA configured, internet still dead", covered in the troubleshooting chapter. (2) Enabling NAT on a private-color transport. (3) Typing the wrong interface in the overload rule. (4) Expecting traffic to flow as soon as NAT is on.</p></div>

<div class="exam"><p><b>Exam trap.</b> The NAT list <code>nat-dia-vpn-hop-access-list</code> is system-generated: you never add permit lines to it, and a DIA problem is never fixed by editing it. The two things you control are the outside marking on the transport and the overload rule.</p></div>

<div class="scn"><h4>Everything is "up" and nothing breaks out</h4><p>An engineer enabled NAT on the Pune transport through the VPN 0 interface template, saw the template push succeed, and told the helpdesk that local internet was live. Users noticed no change: tracerouting still went via Mumbai. On the edge, show ip nat statistics listed GigabitEthernet1 as an outside interface with 0 translations, and the VPN 10 routing table still had the OMP default. NAT was working; there was simply no route or policy that used it. They added the NAT DIA route in the next chapter and translations appeared immediately.</p><p><b>Lesson:</b> NAT prepares the exit; steering opens the door.</p></div>

<div class="iv"><p class="q">"What configuration is needed on a WAN Edge to use a transport interface for Direct Internet Access?"</p><p>NAT enabled on the VPN 0 transport interface (ip nat outside plus the overload rule using the DIA system list on that interface, or the NAT toggle in the interface template), a default route in VPN 0 to the ISP, and then a steering mechanism: either an ip nat route in the service VPN or a centralized data policy with nat use-vpn 0. Add that control connections and BFD are unaffected because they are sourced from the router itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA translates private branch addresses to the transport address with PAT (overload) on the VPN 0 interface.</li>
<li>Two pieces: ip nat outside on the transport, and ip nat inside source list nat-dia-vpn-hop-access-list interface ... overload.</li>
<li>In Manager it is the NAT toggle of the VPN 0 interface feature template.</li>
<li>NAT alone sends nothing out; a NAT route or a data policy must steer traffic to it.</li>
<li>Control and BFD traffic are not affected because the router sources them itself.</li>
</ul></div>
`,hi:`
<p>Har DIA design ek hi pehle step se shuru hota hai: transport interface ko aisa banao ki woh private branch addresses ko apne public address mein translate kar sake. Iske bina 10.1.10.10 ka packet private source address ke saath Pune se niklega, aur internet ya to use drop kar dega ya jawab hi nahi dega. Yeh chapter batata hai ki exactly kya configure karna hai, configuration kya karti hai, aur saabit kaise karna hai ki woh lagi hui hai.</p>

<h3>Analogy: ek hi postal address wala flats ka block</h3>
<p>Ek bade apartment block mein saikdon flats hote hain lekin ek hi street address. Har resident letter par apna flat number likhta hai; building ka reception envelope par building ka address lagata hai, yaad rakhta hai kisne kya bheja, aur reply sahi flat tak pahunchata hai. Woh reception <b>NAT</b> hai. Jab kai inside hosts ek outside address share karte hain aur reception unhe port number se alag pehchanta hai, to use <b>PAT</b> (port address translation) ya <b>NAT overload</b> kehte hain.</p>

<h3>Teen terms mein NAT</h3>
<dl class="terms">
<dt>Inside local</dt><dd>Host ka private address jaisa branch dekhti hai, jaise 10.1.10.10.</dd>
<dt>Inside global</dt><dd>Woh public address jisse woh host internet par dikhta hai, jaise transport address 203.0.113.10.</dd>
<dt>Outside interface</dt><dd>Internet ki taraf wala interface: yahan E-BR1 ka transport interface GigabitEthernet1.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="E-BR1 transport interface par PAT">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="70" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.10</text>
<rect x="230" y="40" width="190" height="80" rx="8" fill="#bae6fd"/><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="14">E-BR1 (NAT)</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="12">Gi3 inside   Gi1 outside</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">Gi1 par overload</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<line x1="130" y1="80" x2="230" y2="80" stroke="#64748b" stroke-width="3"/><text x="180" y="72" text-anchor="middle" class="svg-accent" font-size="11">src 10.1.10.10</text>
<line x1="420" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="3"/><text x="470" y="72" text-anchor="middle" class="svg-accent" font-size="11">src 203.0.113.10</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Kai inside hosts, ek outside address, port se alag.</text>
</svg><p class="cap">Transport par PAT: GigabitEthernet1 se nikalte waqt source address rewrite hota hai.</p></div>

<h3>IOS XE WAN Edge par kya configure karna hai</h3>
<p>DIA NAT ko WAN Edge par, global (VPN 0) context mein, configuration ke do hisse chahiye:</p>
<pre class="code"><span class="c">! E-BR1, controller mode: use config-transaction and commit</span>
E-BR1# config-transaction
E-BR1(config)# interface GigabitEthernet1
E-BR1(config-if)# ip nat outside
E-BR1(config-if)# exit
E-BR1(config)# ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload
E-BR1(config)# commit</pre>
<ul>
<li><code>ip nat outside</code> transport ko translation ka outside mark karta hai.</li>
<li><code>nat-dia-vpn-hop-access-list</code> ek <b>system-generated</b> list hai jo service VPN se transport ko DIA ke liye diya ja raha traffic match karti hai. Iski entries aap nahi likhte; DIA active hone par edge khud bharta hai.</li>
<li><code>interface GigabitEthernet1 overload</code> ka matlab PAT: saare hosts interface address share karte hain aur port se alag hote hain.</li>
</ul>
<p>SD-WAN Manager mein yeh VPN 0 interface par ek toggle hai: <b>VPN Interface Ethernet</b> feature template mein (ya configuration-group ke transport profile ke WAN interface feature mein) aap <b>NAT</b> ko On karte ho, NAT type mein <b>Interface</b> chunte ho, aur UDP aur TCP timeouts adjust kar sakte ho. Result wahi do lines hain.</p>

<div class="note"><p><b>Do alag NATs.</b> Yeh NAT branch se internet jaate <i>user</i> traffic ko translate karta hai. Yeh woh NAT nahi hai jo upstream ISP router edge ke apne tunnel traffic par laga sakta hai; fabric woh case control connection setup ke dauran seekhe public IP aur port se automatically handle karta hai. Exam sawaal mein dono ko mix mat karo.</p></div>

<h3>NAT kya nahi karta</h3>
<p><b>NAT on karne se koi user traffic bahar nahi jaata.</b> Yeh sirf interface ko DIA exit ke layak banata hai. User traffic tab tak VPN 10 routing table follow karta hai (jaise data center ka OMP default route) jab tak NAT route ya data policy use transport ki taraf steer na kare. Is chapter ka sabse important idea yahi hai.</p>
<p>TLOC interface par NAT fabric ko bhi disturb nahi karta. Control connections (DTLS ya TLS) aur IPsec ke andar BFD sessions router khud VPN 0 se source karta hai, kisi service VPN se nahi, isliye DIA rule unhe match nahi karta.</p>

<h3>VPN 0 mein prerequisites</h3>
<ul>
<li>Transport interface ke paas VPN 0 mein ISP gateway ka <b>default route</b> hona chahiye (lab mein <code>ip route 0.0.0.0 0.0.0.0 203.0.113.9</code>). Edge ko Validator tak pahunchne ke liye yeh pehle se chahiye, isliye aam taur par yeh maujood hota hai.</li>
<li>Color internet-facing hona chahiye jaise <code>biz-internet</code>. MPLS (private) transport par NAT ke saath bhi internet ka path nahi hota.</li>
</ul>

<h3>Saabit karna ki yeh lagi hai</h3>
<pre class="out">E-BR1# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic; 0 extended)
Outside interfaces:
  <span class="hl">GigabitEthernet1</span>
Inside interfaces:
  (none yet, DIA hands traffic from the service VPN internally)
Hits: 0  Misses: 0
Dynamic mappings:
-- Inside Source
[Id: 1] access-list nat-dia-vpn-hop-access-list interface GigabitEthernet1 refcount 0

E-BR1# show running-config interface GigabitEthernet1
interface GigabitEthernet1
 ip address 203.0.113.10 255.255.255.252
 <span class="hl">ip nat outside</span>
 negotiation auto</pre>
<p>Is point par zero translations expected hain: abhi koi cheez traffic ko interface ki taraf steer nahi kar rahi. Aap yeh check karte ho ki transport <b>Outside interfaces</b> ke neeche listed hai aur dynamic mapping interface address ke saath overload use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke E-BR1 ka transport GigabitEthernet1 203.0.113.10/30 hai aur ISP gateway 203.0.113.9. Do NAT lines commit hone ke baad bhi user ka 8.8.8.8 ko ping Mumbai se hi jaata hai kyunki VPN 10 default route E-DC se OMP ne seekha hai. Chapter 3 (NAT route) ya chapter 4 (data policy) ke baad hi STAFF-PC ya GUEST-PC locally nikalte hain, aur tab <code>show ip nat translations</code> 10.1.10.10 ko 203.0.113.10 mein translate hua dikhata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Overload rule configure karna lekin transport par <code>ip nat outside</code> bhool jaana (ya ulta); aadha NAT "DIA configured, internet phir bhi dead" ka number one cause hai, troubleshooting chapter mein covered. (2) Private-color transport par NAT enable karna. (3) Overload rule mein galat interface likhna. (4) NAT on hote hi traffic chalne ki ummeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT list <code>nat-dia-vpn-hop-access-list</code> system-generated hai: aap uspar kabhi permit lines nahi jodte, aur DIA problem use edit karke theek nahi hoti. Jo do cheezein aap control karte ho: transport par outside marking aur overload rule.</p></div>

<div class="scn"><h4>Sab "up" hai aur kuch bahar nahi nikalta</h4><p>Ek engineer ne VPN 0 interface template se Pune transport par NAT enable kiya, template push successful dekha, aur helpdesk ko bataya ki local internet live hai. Users ko koi badlav nahi dikha: traceroute ab bhi Mumbai se jaata tha. Edge par show ip nat statistics GigabitEthernet1 ko outside interface dikha raha tha 0 translations ke saath, aur VPN 10 routing table mein ab bhi OMP default tha. NAT kaam kar raha tha; bas koi route ya policy use istemal nahi kar rahi thi. Agle chapter mein unhone NAT DIA route jodi aur translations turant dikhne lage.</p><p><b>Lesson:</b> NAT exit taiyaar karta hai; steering darwaza kholti hai.</p></div>

<div class="iv"><p class="q">"Direct Internet Access ke liye transport interface use karne ke liye WAN Edge par kaunsi configuration chahiye?"</p><p>VPN 0 transport interface par NAT enabled (ip nat outside plus us interface par DIA system list wala overload rule, ya interface template mein NAT toggle), VPN 0 mein ISP ka default route, aur phir steering mechanism: ya to service VPN mein ip nat route ya nat use-vpn 0 wali centralized data policy. Jodo ki control connections aur BFD par asar nahi padta kyunki woh router khud source karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA VPN 0 interface par PAT (overload) se private branch addresses ko transport address mein translate karta hai.</li>
<li>Do hisse: transport par ip nat outside, aur ip nat inside source list nat-dia-vpn-hop-access-list interface ... overload.</li>
<li>Manager mein yeh VPN 0 interface feature template ka NAT toggle hai.</li>
<li>Akela NAT kuch bahar nahi bhejta; NAT route ya data policy ko traffic wahan steer karna padta hai.</li>
<li>Control aur BFD traffic par asar nahi hota kyunki router unhe khud source karta hai.</li>
</ul></div>
`}};export{e as default};