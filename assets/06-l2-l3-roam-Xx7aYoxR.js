var e={id:`l2-l3-roam`,h:{en:`Layer 2 versus Layer 3 roam, anchor and foreign (lab wl-mob-roam)`,hi:`Layer 2 versus Layer 3 roam, anchor aur foreign (lab wl-mob-roam)`},body:{en:`
<h3>The core question: does the subnet change?</h3>
<p>A client has one IP address. Its address belongs to a subnet, and its default gateway is on that subnet. If the client moves to a place where the network offers a <i>different</i> subnet, two things could happen. The client could ask for a new address (all its sessions die), or the network could keep carrying the client's packets to its <b>original</b> subnet so nothing changes for the user. The second option is the <b>Layer 3 roam</b>. When the subnet is the same, there is nothing to hide and the roam is <b>Layer 2</b>.</p>

<table class="cmp"><tr><th></th><th>Layer 2 roam</th><th>Layer 3 roam</th></tr>
<tr><td>Subnet at the new AP</td><td>Same VLAN, same subnet</td><td>Different VLAN, different subnet</td></tr>
<tr><td>Client address</td><td>Kept</td><td>Kept</td></tr>
<tr><td>Tunnel between controllers</td><td>No (only a context hand-over)</td><td>Yes: foreign to anchor over the data path</td></tr>
<tr><td>Where the client's traffic leaves</td><td>At the new controller, same VLAN</td><td>At the <b>anchor</b>, in its original VLAN</td></tr>
<tr><td>Needs mobility peer Up</td><td>Yes (between controllers)</td><td>Yes</td></tr>
</table>

<h3>The roles: anchor and foreign</h3>
<dl class="terms">
<dt>Anchor controller</dt><dd>The controller the client first joined. It owns the client's address and VLAN interface. It stays the "home" for the whole life of the session.</dd>
<dt>Foreign controller</dt><dd>The controller whose AP the client is now using. It terminates the radio side (CAPWAP from the AP) and tunnels the client's traffic to the anchor.</dd>
<dt>Symmetric tunnelling</dt><dd>Traffic goes through the tunnel in both directions: client to anchor, and anchor to client. This avoids the old problem of a router dropping packets whose source address belongs to a different subnet (reverse-path checks). The 9800 always works this way.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="L3 roam path">
<rect x="20" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC1 = anchor</text><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20, 10.10.20.0/24</text>
<rect x="470" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC2 = foreign</text><text x="545" y="65" text-anchor="middle" class="svg-ink" font-size="12">VLAN 120 locally</text>
<line x1="170" y1="50" x2="470" y2="50" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="12">data path: client traffic</text>
<rect x="470" y="130" width="70" height="34" rx="6" fill="#bbf7d0"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<line x1="545" y1="80" x2="505" y2="130" stroke="#64748b"/>
<rect x="470" y="205" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="230" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1 10.10.20.55</text>
<line x1="505" y1="164" x2="505" y2="205" stroke="#64748b" stroke-dasharray="3 3"/>
<rect x="20" y="130" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="155" text-anchor="middle" class="svg-ink" font-size="12">R1 gateway 10.10.20.1</text>
<line x1="95" y1="80" x2="95" y2="130" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">The client is physically in Delhi but its traffic leaves in Mumbai.</text>
</svg><p class="cap">After an L3 roam the client keeps its Mumbai address. WLC2 is foreign, WLC1 is anchor, and the client reaches SRV-MUM through R1.</p></div>

<h3>How the controller decides</h3>
<p>When WLC2 receives the reassociation it asks its peers. If WLC1 owns the client, WLC2 compares the VLAN that its own policy profile would use with the VLAN the client has on WLC1. <b>If the VLAN IDs are equal, the controller assumes the same subnet</b> and performs a Layer 2 roam. <b>If they differ and the tunnel is Up</b>, it performs a Layer 3 roam. The WLAN (same SSID and same security) must also exist on both. If the peer is Down or the WLAN differs, the client falls back to a hard roam and re-addresses.</p>
<p>That is why the lab deliberately names the VLANs differently: staff are VLAN 20 in Mumbai and VLAN 120 in Delhi. Engineers sometimes reuse the same VLAN ID for different subnets in two cities. The controllers then perform an L2 roam, the client keeps an address that is wrong for the new subnet, and it loses connectivity. Match VLAN IDs only when the subnets really match.</p>

<h3>The lab: wl-mob-roam</h3>
<p>The group is Up. LAPTOP1 starts on NK-STAFF near AP1 with an address in 10.10.20.0/24. The simulator helper <code>wifi walk &lt;AP name&gt;</code> moves the client next to an AP and lets it reassociate (a real client roams by itself).</p>
<pre class="code"><span class="c">! on LAPTOP1</span>
wifi walk AP2
wifi walk AP3
ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi walk AP2
Walking to AP2 (about 3 m away) ...
Associated to AP2 (BSSID 0011.2233.4402)
Roam: AP1 (WLC1) -&gt; AP2 (WLC1): L2 Roam, address 10.10.20.55 kept

LAPTOP1&gt; wifi walk AP3
Walking to AP3 (about 3 m away) ...
Associated to AP3 (BSSID 0011.2233.4403)
<span class="hl">Roam: AP2 (WLC1) -&gt; AP3 (WLC2): L3 Roam, address 10.10.20.55 kept, anchored on WLC1</span></pre>
<p>Evidence on the controllers. On WLC2 (foreign) the client detail shows the mobility block:</p>
<pre class="out">WLC2# show wireless client mac-address 0050.7966.6801 detail
Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.55
SSID               : NK-STAFF
Mobility:
  Move Count                  : 2
  <span class="hl">Mobility Role               : Foreign</span>
  <span class="hl">Mobility Roam Type          : L3 Roam</span>
  Anchor Controller           : WLC1 (10.10.99.10)

WLC1# show wireless mobility statistics
Client roams handled
  L2 roams (same VLAN, IP kept)     : 1
  L3 roams, this controller foreign : 0
  <span class="hl">L3 roams, this controller anchor  : 1</span>
  Hard roams (client re-addressed)  : 0
Clients anchored on this controller : 1</pre>
<p>On the anchor WLC1 the same client shows <code>Mobility Role : Anchor</code> and the Foreign Controller line. In the web UI open <b>Monitoring &gt; Wireless &gt; Clients</b> and the client detail, then <b>Monitoring &gt; Mobility</b> for the counters. The three tasks of the lab ask you to prove an L2 roam, then an L3 roam with WLC2 foreign and WLC1 anchor, then that the client still holds its Mumbai address and reaches SRV-MUM.</p>
<div class="note"><p>Simulator approximation: the data plane attaches an anchored client to the anchor's VLAN interface, which gives the same VLAN placement as the real tunnel. The rules that decide it (peer Up, same WLAN, different VLAN) are the real ones. Real controllers also tunnel in the packet trace; the simulator shows only the AP-to-controller leg.</p></div>

<h3>The cost of an L3 roam</h3>
<ul>
<li><b>Hair-pinning.</b> Traffic from the client in Delhi to a Delhi server goes to Mumbai and back, adding WAN delay.</li>
<li><b>The anchor is a single point of failure for that client.</b> If the tunnel or the anchor fails, the client is dropped and reconnects as a hard roam with a new address.</li>
<li><b>State to track.</b> Every anchored client consumes resources on both controllers.</li>
</ul>
<p>This is why large designs prefer to make roaming domains <i>one subnet wide</i> (a flat VLAN per SSID across controllers within a campus) and keep L3 roaming for the exceptions. FlexConnect and Fabric designs (later modules) avoid the issue differently.</p>

<div class="eg"><p><b>Worked example.</b> A campus has two buildings, each with its own controller. Staff VLAN 20 (10.10.20.0/24) exists in building A, VLAN 120 (10.20.20.0/24) in building B. A user walking from A to B stays on 10.10.20.55 because B tunnels back to A. If the user then goes home and returns the next day to building B, the first join happens in B, so B becomes the anchor of the new session and the address will be 10.20.20.x.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reusing a VLAN ID for two different subnets across controllers. Expecting an L3 roam when the peer is Down (you get a hard roam). Forgetting that the foreign controller needs the WLAN with the same SSID and security. Judging the roam by the AP name: the proof is the roam type and roles in the client detail.</p></div>

<div class="exam"><p><b>Exam trap.</b> In a Layer 3 roam the controller that currently holds the radio is the <b>foreign</b>, and the one that first handled the client is the <b>anchor</b>. Candidates swap them. The anchor keeps the client's VLAN and address.</p></div>

<div class="scn"><h4>Same VLAN ID, wrong subnet</h4><p>A university gave Library and Science buildings the same staff VLAN ID 30 on two controllers, but each building had its own /24. Users who walked between buildings kept an address from the old subnet while the gateway they could reach was the new one. Web browsing worked intermittently. The roams were classified L2 because VLAN IDs matched. Renumbering Science to VLAN 130 turned the walk into a proper L3 roam through the tunnel and the problem disappeared.</p><p><b>Lesson:</b> the roam type is decided by comparing VLAN IDs, so VLAN naming across sites must reflect real subnets.</p></div>

<div class="iv"><p class="q">"Explain what happens when a client roams between two controllers that use different VLANs for the same SSID."</p><p>Foreign asks its peers, finds the anchor, sees the VLAN differs, and builds a tunnel. The client keeps its IP, its traffic goes foreign to anchor and exits in the anchor's VLAN. Mention symmetric tunnelling, hair-pinning, and that the anchor is a single point of failure for that client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 roam: same VLAN, address kept, no data tunnel. L3 roam: different VLAN, address kept via a tunnel to the anchor.</li>
<li>Anchor is where the client first joined; foreign is where it is now.</li>
<li>The controller compares VLAN IDs; equal IDs are treated as the same subnet.</li>
<li>The cost of L3 roaming is hair-pinning and a single point of failure.</li>
<li>Prove it with show wireless client detail (role and roam type) and show wireless mobility statistics.</li>
</ul></div>
`,hi:`
<h3>Core sawal: kya subnet badalta hai?</h3>
<p>Client ka ek IP address hota hai. Address ek subnet ka hota hai, aur uska default gateway usi subnet par hota hai. Agar client aisi jagah jaata hai jahan network <i>alag</i> subnet deta hai, to do cheezein ho sakti hain. Client naya address maang sakta hai (uske saare sessions mar jaate hain), ya network client ke packets ko uske <b>original</b> subnet tak le jaata rahe taaki user ke liye kuch na badle. Doosra option <b>Layer 3 roam</b> hai. Jab subnet same ho to chhupane ko kuch nahi, aur roam <b>Layer 2</b> hai.</p>

<table class="cmp"><tr><th></th><th>Layer 2 roam</th><th>Layer 3 roam</th></tr>
<tr><td>Naye AP par subnet</td><td>Same VLAN, same subnet</td><td>Alag VLAN, alag subnet</td></tr>
<tr><td>Client address</td><td>Kept</td><td>Kept</td></tr>
<tr><td>Controllers ke beech tunnel</td><td>Nahi (sirf context hand-over)</td><td>Haan: foreign se anchor tak data path par</td></tr>
<tr><td>Client ka traffic kahan nikalta hai</td><td>Naye controller par, same VLAN mein</td><td><b>Anchor</b> par, uske original VLAN mein</td></tr>
<tr><td>Mobility peer Up chahiye</td><td>Haan (controllers ke beech)</td><td>Haan</td></tr>
</table>

<h3>Roles: anchor aur foreign</h3>
<dl class="terms">
<dt>Anchor controller</dt><dd>Jis controller par client pehle join hua. Woh client ka address aur VLAN interface own karta hai. Pure session ke liye "home" rehta hai.</dd>
<dt>Foreign controller</dt><dd>Jis controller ke AP ko client ab use kar raha hai. Woh radio side (AP se CAPWAP) terminate karta hai aur client ka traffic anchor tak tunnel karta hai.</dd>
<dt>Symmetric tunnelling</dt><dd>Traffic tunnel se dono directions mein jaata hai: client se anchor, aur anchor se client. Isse purani problem bachti hai jisme router un packets ko drop kar deta tha jinka source address alag subnet ka hota tha (reverse-path checks). 9800 hamesha aise hi kaam karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="L3 roam path">
<rect x="20" y="20" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC1 = anchor</text><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20, 10.10.20.0/24</text>
<rect x="470" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="13">WLC2 = foreign</text><text x="545" y="65" text-anchor="middle" class="svg-ink" font-size="12">VLAN 120 locally</text>
<line x1="170" y1="50" x2="470" y2="50" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="42" text-anchor="middle" class="svg-accent" font-size="12">data path: client traffic</text>
<rect x="470" y="130" width="70" height="34" rx="6" fill="#bbf7d0"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<line x1="545" y1="80" x2="505" y2="130" stroke="#64748b"/>
<rect x="470" y="205" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="230" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1 10.10.20.55</text>
<line x1="505" y1="164" x2="505" y2="205" stroke="#64748b" stroke-dasharray="3 3"/>
<rect x="20" y="130" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="95" y="155" text-anchor="middle" class="svg-ink" font-size="12">R1 gateway 10.10.20.1</text>
<line x1="95" y1="80" x2="95" y2="130" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Client physically Delhi mein hai, lekin traffic Mumbai mein nikalta hai.</text>
</svg><p class="cap">L3 roam ke baad client apna Mumbai address rakhta hai. WLC2 foreign hai, WLC1 anchor hai, aur client R1 ke zariye SRV-MUM tak pahunchta hai.</p></div>

<h3>Controller kaise decide karta hai</h3>
<p>Jab WLC2 ko reassociation milta hai to woh peers se poochta hai. Agar WLC1 client ka maalik hai, to WLC2 us VLAN ko compare karta hai jo uska apna policy profile use karta aur jo VLAN client ke paas WLC1 par hai. <b>Agar VLAN IDs barabar hain to controller maan leta hai ki subnet same hai</b> aur Layer 2 roam karta hai. <b>Agar alag hain aur tunnel Up hai</b>, to Layer 3 roam karta hai. WLAN (same SSID aur same security) dono par honi chahiye. Agar peer Down hai ya WLAN alag hai, to client hard roam par girta hai aur re-address hota hai.</p>
<p>Isiliye lab jaan boojh kar VLANs ko alag naam deta hai: staff Mumbai mein VLAN 20 aur Delhi mein VLAN 120 hai. Engineers kabhi kabhi do shehron mein alag subnets ke liye wahi VLAN ID reuse kar dete hain. Tab controllers L2 roam karte hain, client apna address rakhta hai jo naye subnet ke liye galat hai, aur connectivity kho deta hai. VLAN IDs tabhi match karo jab subnets sach mein match karte hon.</p>

<h3>Lab: wl-mob-roam</h3>
<p>Group Up hai. LAPTOP1 NK-STAFF par AP1 ke paas 10.10.20.0/24 ke address ke saath shuru hota hai. Simulator helper <code>wifi walk &lt;AP name&gt;</code> client ko AP ke paas le jaata hai aur use reassociate karne deta hai (asli client khud roam karta hai).</p>
<pre class="code"><span class="c">! LAPTOP1 par</span>
wifi walk AP2
wifi walk AP3
ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi walk AP2
Walking to AP2 (about 3 m away) ...
Associated to AP2 (BSSID 0011.2233.4402)
Roam: AP1 (WLC1) -&gt; AP2 (WLC1): L2 Roam, address 10.10.20.55 kept

LAPTOP1&gt; wifi walk AP3
Walking to AP3 (about 3 m away) ...
Associated to AP3 (BSSID 0011.2233.4403)
<span class="hl">Roam: AP2 (WLC1) -&gt; AP3 (WLC2): L3 Roam, address 10.10.20.55 kept, anchored on WLC1</span></pre>
<p>Controllers par evidence. WLC2 (foreign) par client detail mobility block dikhata hai:</p>
<pre class="out">WLC2# show wireless client mac-address 0050.7966.6801 detail
Client MAC Address : 0050.7966.6801
Client IPv4 Address: 10.10.20.55
SSID               : NK-STAFF
Mobility:
  Move Count                  : 2
  <span class="hl">Mobility Role               : Foreign</span>
  <span class="hl">Mobility Roam Type          : L3 Roam</span>
  Anchor Controller           : WLC1 (10.10.99.10)

WLC1# show wireless mobility statistics
Client roams handled
  L2 roams (same VLAN, IP kept)     : 1
  L3 roams, this controller foreign : 0
  <span class="hl">L3 roams, this controller anchor  : 1</span>
  Hard roams (client re-addressed)  : 0
Clients anchored on this controller : 1</pre>
<p>Anchor WLC1 par wahi client <code>Mobility Role : Anchor</code> aur Foreign Controller line dikhata hai. Web UI mein <b>Monitoring &gt; Wireless &gt; Clients</b> aur client detail kholo, phir counters ke liye <b>Monitoring &gt; Mobility</b>. Lab ke teen tasks aapse L2 roam prove karwate hain, phir L3 roam jisme WLC2 foreign aur WLC1 anchor ho, phir yeh ki client ke paas abhi bhi Mumbai address hai aur woh SRV-MUM tak pahunchta hai.</p>
<div class="note"><p>Simulator approximation: data plane anchored client ko anchor ke VLAN interface se attach karta hai, jo asli tunnel jaisi hi VLAN placement deta hai. Jo rules decide karte hain (peer Up, same WLAN, alag VLAN) woh asli hain. Asli controllers packet trace mein bhi tunnel dikhate hain; simulator sirf AP-to-controller leg dikhata hai.</p></div>

<h3>L3 roam ki keemat</h3>
<ul>
<li><b>Hair-pinning.</b> Delhi mein client se Delhi server tak ka traffic Mumbai jaakar wapas aata hai, WAN delay badhta hai.</li>
<li><b>Anchor us client ke liye single point of failure hai.</b> Tunnel ya anchor fail ho to client drop ho jaata hai aur naye address ke saath hard roam ki tarah reconnect karta hai.</li>
<li><b>Track karne ki state.</b> Har anchored client dono controllers par resources khata hai.</li>
</ul>
<p>Isiliye bade designs roaming domains ko <i>ek subnet wide</i> rakhna pasand karte hain (campus ke andar controllers ke across har SSID ke liye ek flat VLAN) aur L3 roaming sirf exceptions ke liye. FlexConnect aur Fabric designs (aage ke modules) is issue se alag tareeke se bachte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus mein do buildings hain, har ek ka apna controller. Staff VLAN 20 (10.10.20.0/24) building A mein hai, VLAN 120 (10.20.20.0/24) building B mein. A se B tak chalne wala user 10.10.20.55 par rehta hai kyunki B wapas A tak tunnel karta hai. Agar user ghar jaakar agle din building B mein wapas aaye, to pehla join B mein hota hai, isliye B naye session ka anchor ban jaata hai aur address 10.20.20.x hoga.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Controllers ke across do alag subnets ke liye ek hi VLAN ID reuse karna. Peer Down hone par L3 roam expect karna (hard roam milta hai). Yeh bhoolna ki foreign controller ko same SSID aur security wali WLAN chahiye. Roam ko AP ke naam se judge karna: proof client detail mein roam type aur roles hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Layer 3 roam mein jo controller abhi radio hold karta hai woh <b>foreign</b> hai, aur jisne client ko pehle handle kiya woh <b>anchor</b> hai. Candidates inhe swap kar dete hain. Anchor client ka VLAN aur address rakhta hai.</p></div>

<div class="scn"><h4>Same VLAN ID, galat subnet</h4><p>Ek university ne Library aur Science buildings ko do controllers par same staff VLAN ID 30 diya, lekin har building ka apna /24 tha. Jo users buildings ke beech chalte the unke paas purane subnet ka address rehta tha jabki jo gateway reach hota tha woh naya tha. Web browsing kabhi chalti kabhi nahi. Roams L2 classify hue kyunki VLAN IDs match karti thi. Science ko VLAN 130 mein renumber karne se walk sahi L3 roam ban gayi tunnel ke zariye aur problem khatam ho gayi.</p><p><b>Lesson:</b> roam type VLAN IDs compare karke decide hota hai, isliye sites ke across VLAN naming asli subnets ko reflect kare.</p></div>

<div class="iv"><p class="q">"Samjhao jab client do controllers ke beech roam karta hai jo same SSID ke liye alag VLANs use karte hain, to kya hota hai."</p><p>Foreign peers se poochta hai, anchor dhundta hai, dekhta hai ki VLAN alag hai, aur tunnel banata hai. Client apna IP rakhta hai, uska traffic foreign se anchor tak jaata hai aur anchor ke VLAN mein nikalta hai. Symmetric tunnelling, hair-pinning, aur yeh ki anchor us client ke liye single point of failure hai, yeh mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 roam: same VLAN, address kept, data tunnel nahi. L3 roam: alag VLAN, address kept anchor tak tunnel se.</li>
<li>Anchor jahan client pehle join hua; foreign jahan abhi hai.</li>
<li>Controller VLAN IDs compare karta hai; barabar IDs ko same subnet maana jata hai.</li>
<li>L3 roaming ki keemat hair-pinning aur single point of failure hai.</li>
<li>show wireless client detail (role aur roam type) aur show wireless mobility statistics se prove karo.</li>
</ul></div>
`}};export{e as default};