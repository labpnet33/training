function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i){return`<circle cx="`+t+`" cy="`+n+`" r="15" fill="`+r+`" stroke="#64748b"/><path d="M`+(t-8)+` `+n+`H`+(t+8)+`M`+t+` `+(n-8)+`V`+(n+8)+`" stroke="#1e293b" stroke-width="2"/>`+e(t,n+30,i,`svg-ink`,11)}function r(e,t,n,r,i){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`}function i(i){return`<div class="dia"><svg viewBox="0 0 640 350" role="img" aria-label="`+i.alt+`">`+e(320,20,i.t,`svg-accent`,13)+r(150,65,150,134)+r(490,65,490,134)+r(150,245,150,166)+r(330,245,150,166)+r(490,245,150,166)+r(150,245,490,166)+r(330,245,490,166)+r(490,245,490,166)+t(150,150,`#bae6fd`,`MPLS`)+t(490,150,`#bbf7d0`,`Internet`)+e(150,182,i.c1,`svg-muted`,11)+e(490,182,i.c2,`svg-muted`,11)+n(150,50,`#ddd6fe`,i.h1)+n(490,50,`#ddd6fe`,i.h2)+n(150,260,`#fde68a`,i.sa)+n(330,260,`#fde68a`,i.sb)+n(490,260,`#fde68a`,i.sc)+`<path d="M150 276 Q320 340 490 276" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="5 4"/>`+e(320,322,i.sh,`svg-accent`,11)+`</svg><p class="cap">`+i.cap+`</p></div>`}var a=i({alt:`Dual-hub dual-cloud DMVPN with three spokes and a Phase 3 shortcut`,t:`Dual-hub, dual-cloud DMVPN (Phase 3)`,c1:`Tunnel0`,c2:`Tunnel1`,h1:`Hub 1 (DC1)`,h2:`Hub 2 (DC2)`,sa:`Branch A`,sb:`Branch B`,sc:`Branch C`,sh:`Phase 3 shortcut tunnel`,cap:`Each hub lives in one DMVPN cloud and each branch builds a tunnel into both clouds. Purple = hub, amber = spoke, dashed blue = the direct spoke-to-spoke shortcut built on demand.`}),o=i({alt:`Dual-hub dual-cloud DMVPN, teen spokes aur Phase 3 shortcut ke saath`,t:`Dual-hub, dual-cloud DMVPN (Phase 3)`,c1:`Tunnel0`,c2:`Tunnel1`,h1:`Hub 1 (DC1)`,h2:`Hub 2 (DC2)`,sa:`Branch A`,sb:`Branch B`,sc:`Branch C`,sh:`Phase 3 shortcut tunnel`,cap:`Har hub ek DMVPN cloud mein rehta hai aur har branch dono clouds mein tunnel banata hai. Purple = hub, amber = spoke, dashed blue = on-demand bana direct spoke-to-spoke shortcut.`}),s={id:`vpn-overlays`,h:{en:`Customer case: credit union VPN overlays with DMVPN, IPsec and GETVPN`,hi:`Customer case: credit union ke VPN overlays DMVPN, IPsec aur GETVPN ke saath`},body:{en:`
<h3>The customer: Meridian Credit Union</h3>
<p><b>Meridian Credit Union</b> has 62 branches, a head office and 2 data centres. Today the branches use a hand-built mesh of static IPsec tunnels: every new branch needs configuration on many routers, and the audit team flagged the mix of encrypted and clear-text links. About 20 larger branches also have an MPLS circuit; 42 smaller ones have internet only. Tellers use video banking, so about 15% of traffic is branch-to-branch. The brief: encrypt all member data, onboard a branch in a day, keep branch-to-branch video off the data centre links, and survive the loss of a data centre.</p>

<h3>The options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Static IPsec VTI hub-and-spoke</b></td><td>Simple, predictable</td><td>Every spoke is configured on the hub; spoke-to-spoke traffic hairpins through the hub</td></tr>
<tr><td><b>DMVPN Phase 1</b></td><td>Hub is mGRE, spokes are point-to-point GRE, tiny spoke config</td><td>All spoke traffic goes through the hub</td></tr>
<tr><td><b>DMVPN Phase 2</b></td><td>Spokes resolve each other with NHRP and build direct tunnels</td><td>Hub must send full routes with the original spoke as next hop, so no summarization</td></tr>
<tr><td><b>DMVPN Phase 3</b></td><td>Hub sends NHRP redirect, spoke installs a shortcut; hub can summarize or send a default route</td><td>Needs a newer software image; shortcut routes must be understood by the design</td></tr>
<tr><td><b>GETVPN</b></td><td>Group encryption with no tunnels, original IP header kept, native any-to-any, good for QoS and multicast</td><td>Needs a private, routable WAN such as MPLS; does not work across the internet</td></tr>
<tr><td><b>FlexVPN</b></td><td>IKEv2-based, flexible, AAA-driven policies</td><td>More design effort; same overlay idea as DMVPN</td></tr></table>

<h3>How DMVPN works in one minute</h3>
<p>A <b>hub</b> uses one multipoint GRE (mGRE) interface for all spokes. Each <b>spoke</b> registers its public (NBMA) address with the hub, which acts as the <b>NHRP next hop server</b>. A spoke that needs another spoke asks the hub to resolve the address and builds a direct tunnel. IPsec protects the GRE packets (tunnel protection). The routing protocol runs across the tunnel. Phase 3 is the design target: the hub sends a redirect and the spokes install a shortcut, so the hub can advertise a summary route and still keep traffic direct.</p>

<pre class="code"><span class="c">! Hub 1, Phase 3</span>
interface Tunnel0
 ip address 10.100.0.1 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp map multicast dynamic
 <span class="c">! tell spokes a better path exists</span>
 ip nhrp redirect
 tunnel source GigabitEthernet0/0/0
 tunnel mode gre multipoint
 tunnel protection ipsec profile BANK-IPSEC
<span class="c">! Spoke, Phase 3</span>
interface Tunnel0
 ip address 10.100.0.11 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp nhs 10.100.0.1 nbma 192.0.2.1 multicast
 <span class="c">! install the shortcut after a redirect</span>
 ip nhrp shortcut
 tunnel source GigabitEthernet0/0/0
 tunnel mode gre multipoint
 tunnel protection ipsec profile BANK-IPSEC</pre>
<pre class="out">BR-07# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:2,
 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 192.0.2.1            10.100.0.1    <span class="hl">UP 02:14:10     S</span>
     1 198.51.100.40        10.100.0.23   <span class="hl">UP 00:01:52     D</span></pre>

@@DIA@@

<h3>Chosen design: dual-hub, dual-cloud Phase 3</h3>
<p>Meridian builds <b>two DMVPN clouds</b>. Cloud 1 runs over MPLS with Hub 1 in data centre 1. Cloud 2 runs over the internet with Hub 2 in data centre 2. All 62 branches join cloud 2; the 20 MPLS branches also join cloud 1. Branches keep two tunnels, so a failed transport or a failed data centre is only a routing change. The hubs advertise a summary of the data-centre networks, and a branch-to-branch call triggers a shortcut tunnel. IKEv2 with certificates, AES-GCM and NAT traversal (UDP 4500) cover branches behind carrier NAT.</p>
<p><b>GETVPN consideration.</b> For the MPLS-only part, GETVPN would encrypt without tunnels, so QoS and multicast keep working on the original headers. A <b>key server</b> distributes keys and policy to <b>group members</b> using GDOI, and two key servers (COOP) avoid a single point of failure. Meridian rejected it because 42 branches use the internet, and one overlay is easier to operate than two.</p>
<div class="eg"><p><b>Worked overhead example.</b> A 1500-byte packet plus GRE (24 bytes) plus ESP with tunnel protection (about 50 to 60 bytes) no longer fits. Setting the tunnel IP MTU to 1400 and the TCP MSS to 1360 keeps full-size TCP segments from fragmenting or being dropped.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting MTU and MSS on tunnels. Small pings pass, but large file uploads hang, because ICMP "fragmentation needed" messages are blocked somewhere on the path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 = hub-and-spoke, Phase 2 = direct spoke-to-spoke but no summarization at the hub, Phase 3 = redirect and shortcut with summarization allowed. GETVPN needs a private WAN. DMVPN is the right answer for dynamic spoke-to-spoke over the internet.</p></div>

<div class="scn"><h4>Post-mortem: the summarized route that killed spoke-to-spoke</h4><p>A pilot used Phase 2 but the hub advertised only a default route to save spoke memory. Spokes never learned the other spokes' prefixes, so the NHRP resolution never started and every call hairpinned through the hub, overloading the 100 Mbps hub link at 9 a.m. Moving to Phase 3 (redirect and shortcut) let the hub keep the summary and still get direct tunnels.</p><p><b>Lesson:</b> pick the DMVPN phase from the routing design you need. Summarization at the hub means Phase 3.</p></div>

<div class="iv"><p class="q">"Why choose DMVPN Phase 3 over Phase 2?"</p><p>Phase 3 uses NHRP redirect and shortcut, so the hub can summarize or send a default route and spokes still build direct tunnels. That keeps spoke routing tables small and scales to hundreds of sites. Phase 2 needs full routes with the spoke as next hop, which limits scale. Also mention dual cloud for transport redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN = mGRE + NHRP + IPsec + a routing protocol; spokes register with the hub.</li>
<li>Phase 3 allows summarization with spoke-to-spoke shortcuts, so it is the scalable choice.</li>
<li>Dual-hub dual-cloud gives transport and data-centre redundancy.</li>
<li>GETVPN is tunnel-less, keeps original IP headers and needs a private routable WAN.</li>
<li>Always set tunnel MTU and TCP MSS, and plan NAT traversal for branches.</li>
</ul></div>
`.replace(`@@DIA@@`,a),hi:`
<h3>Customer: Meridian Credit Union</h3>
<p><b>Meridian Credit Union</b> ke 62 branches, ek head office aur 2 data centres hain. Abhi branches static IPsec tunnels ka hand-built mesh use karte hain: har naye branch ke liye kai routers par configuration karni padti hai, aur audit team ne encrypted aur clear-text links ke mix par flag lagaya. Lagbhag 20 bade branches ke paas MPLS circuit bhi hai; 42 chhote branches sirf internet par hain. Tellers video banking use karte hain, isliye lagbhag 15% traffic branch-to-branch hai. Brief: saara member data encrypt karo, ek din mein branch onboard karo, branch-to-branch video ko data centre links se door rakho, aur ek data centre khone par bhi survive karo.</p>

<h3>Options</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Static IPsec VTI hub-and-spoke</b></td><td>Simple, predictable</td><td>Har spoke hub par configure hota hai; spoke-to-spoke traffic hub se hairpin hota hai</td></tr>
<tr><td><b>DMVPN Phase 1</b></td><td>Hub mGRE hai, spokes point-to-point GRE, spoke config chhota</td><td>Saara spoke traffic hub se guzarta hai</td></tr>
<tr><td><b>DMVPN Phase 2</b></td><td>Spokes NHRP se ek doosre ko resolve karke direct tunnels banate hain</td><td>Hub ko original spoke next hop ke saath full routes bhejne padte hain, isliye summarization nahi</td></tr>
<tr><td><b>DMVPN Phase 3</b></td><td>Hub NHRP redirect bhejta hai, spoke shortcut install karta hai; hub summarize ya default route de sakta hai</td><td>Naya software image chahiye; shortcut routes ko design mein samajhna padta hai</td></tr>
<tr><td><b>GETVPN</b></td><td>Tunnels ke bina group encryption, original IP header rehta hai, native any-to-any, QoS aur multicast ke liye achha</td><td>Private routable WAN (jaise MPLS) chahiye; internet par kaam nahi karta</td></tr>
<tr><td><b>FlexVPN</b></td><td>IKEv2-based, flexible, AAA-driven policies</td><td>Design effort zyada; overlay idea DMVPN jaisa hi</td></tr></table>

<h3>DMVPN ek minute mein</h3>
<p><b>Hub</b> saare spokes ke liye ek multipoint GRE (mGRE) interface use karta hai. Har <b>spoke</b> apna public (NBMA) address hub ke paas register karta hai, jo <b>NHRP next hop server</b> ka kaam karta hai. Jis spoke ko doosre spoke tak jaana ho, woh hub se address resolve karwata hai aur direct tunnel banata hai. IPsec GRE packets ko protect karta hai (tunnel protection). Routing protocol tunnel ke upar chalta hai. Phase 3 design target hai: hub redirect bhejta hai aur spokes shortcut install karte hain, isliye hub summary route advertise kar sakta hai aur traffic phir bhi direct rehta hai.</p>

<pre class="code"><span class="c">! Hub 1, Phase 3</span>
interface Tunnel0
 ip address 10.100.0.1 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp map multicast dynamic
 <span class="c">! spokes ko batao ki behtar path hai</span>
 ip nhrp redirect
 tunnel source GigabitEthernet0/0/0
 tunnel mode gre multipoint
 tunnel protection ipsec profile BANK-IPSEC
<span class="c">! Spoke, Phase 3</span>
interface Tunnel0
 ip address 10.100.0.11 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp nhs 10.100.0.1 nbma 192.0.2.1 multicast
 <span class="c">! redirect ke baad shortcut install karo</span>
 ip nhrp shortcut
 tunnel source GigabitEthernet0/0/0
 tunnel mode gre multipoint
 tunnel protection ipsec profile BANK-IPSEC</pre>
<pre class="out">BR-07# show dmvpn
Interface: Tunnel0, IPv4 NHRP Details
Type:Spoke, NHRP Peers:2,
 # Ent  Peer NBMA Addr Peer Tunnel Add State  UpDn Tm Attrb
 ----- --------------- --------------- ----- -------- -----
     1 192.0.2.1            10.100.0.1    <span class="hl">UP 02:14:10     S</span>
     1 198.51.100.40        10.100.0.23   <span class="hl">UP 00:01:52     D</span></pre>

@@DIA@@

<h3>Chosen design: dual-hub, dual-cloud Phase 3</h3>
<p>Meridian <b>do DMVPN clouds</b> banata hai. Cloud 1 MPLS par chalta hai, Hub 1 data centre 1 mein. Cloud 2 internet par chalta hai, Hub 2 data centre 2 mein. Saare 62 branches cloud 2 join karte hain; 20 MPLS branches cloud 1 bhi join karte hain. Branches ke paas do tunnels hote hain, isliye transport ya data centre fail hone par sirf routing change hota hai. Hubs data-centre networks ka summary advertise karte hain, aur branch-to-branch call shortcut tunnel trigger karti hai. Certificates ke saath IKEv2, AES-GCM aur NAT traversal (UDP 4500) carrier NAT ke peeche wale branches ko cover karte hain.</p>
<p><b>GETVPN consideration.</b> Sirf MPLS wale hisse ke liye GETVPN tunnels ke bina encrypt karta, isliye original headers par QoS aur multicast chalte rehte. <b>Key server</b> <b>group members</b> ko GDOI se keys aur policy deta hai, aur do key servers (COOP) single point of failure hatate hain. Meridian ne ise reject kiya kyunki 42 branches internet use karte hain, aur do ki jagah ek overlay operate karna aasan hai.</p>
<div class="eg"><p><b>Worked overhead example.</b> 1500-byte packet plus GRE (24 bytes) plus tunnel protection wala ESP (lagbhag 50 se 60 bytes) ab fit nahi hota. Tunnel IP MTU 1400 aur TCP MSS 1360 set karne se full-size TCP segments fragment ya drop nahi hote.</p></div>

<div class="warn"><p><b>Common mistake.</b> Tunnels par MTU aur MSS bhool jana. Chhote ping pass ho jaate hain, par badi file uploads atak jaati hain, kyunki path mein kahin ICMP "fragmentation needed" messages block hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 = hub-and-spoke, Phase 2 = direct spoke-to-spoke par hub par summarization nahi, Phase 3 = redirect aur shortcut, summarization allowed. GETVPN ko private WAN chahiye. Internet par dynamic spoke-to-spoke ke liye DMVPN sahi jawab hai.</p></div>

<div class="scn"><h4>Post-mortem: summarized route ne spoke-to-spoke maar diya</h4><p>Pilot ne Phase 2 use kiya par spoke memory bachane ke liye hub ne sirf default route advertise kiya. Spokes ko doosre spokes ke prefixes mile hi nahi, isliye NHRP resolution shuru hi nahi hua aur har call hub se hairpin hui, aur subah 9 baje 100 Mbps hub link overload ho gaya. Phase 3 (redirect aur shortcut) par jaane se hub summary rakh paya aur direct tunnels bhi mile.</p><p><b>Lesson:</b> DMVPN phase routing design ke hisaab se chuno. Hub par summarization chahiye to Phase 3.</p></div>

<div class="iv"><p class="q">"Phase 2 ke bajaye DMVPN Phase 3 kyun?"</p><p>Phase 3 NHRP redirect aur shortcut use karta hai, isliye hub summary ya default route de sakta hai aur spokes phir bhi direct tunnels banate hain. Isse spoke routing tables chhote rehte hain aur sainkdon sites tak scale hota hai. Phase 2 mein spoke ko next hop rakhkar full routes chahiye, jo scale limit karta hai. Transport redundancy ke liye dual cloud bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN = mGRE + NHRP + IPsec + routing protocol; spokes hub ke paas register karte hain.</li>
<li>Phase 3 summarization ke saath spoke-to-spoke shortcuts deta hai, isliye scalable choice hai.</li>
<li>Dual-hub dual-cloud transport aur data-centre redundancy deta hai.</li>
<li>GETVPN tunnel-less hai, original IP headers rakhta hai aur private routable WAN chahta hai.</li>
<li>Tunnel MTU aur TCP MSS hamesha set karo, aur branches ke liye NAT traversal plan karo.</li>
</ul></div>
`.replace(`@@DIA@@`,o)}};export{s as default};