var e={id:`ipsec-picture`,h:{en:`IPsec in one picture: IKE SA, child SA and the tunnel interface`,hi:`IPsec ek picture mein: IKE SA, child SA aur tunnel interface`},body:{en:`
<p>Think of two company offices that want to send valuables to each other through a public road. First the two security heads meet, show their ID cards and agree on a secret language. That meeting is slow and careful, and it happens rarely. After that, armoured vans start running between the offices, using keys the two heads agreed on. IPsec works the same way: a slow, careful negotiation (the <b>IKE SA</b>) and then fast encrypted lanes for the real traffic (the <b>child SA</b>, also called the IPsec SA). This module teaches you to build, verify and troubleshoot that system on FortiGate, including <b>ADVPN</b>, the feature that lets branches build direct tunnels to each other.</p>

<h3>What you will learn</h3>
<ul>
<li>How IKE and IPsec fit together, and why a VPN has two kinds of security association.</li>
<li>The phase 1 and phase 2 options the NSE 7 exam asks about, and the exact FortiGate behaviour when they do not match.</li>
<li>How a tunnel interface is addressed, how routes appear, and how BGP runs over the overlay.</li>
<li>How a dial-up hub with static spokes is built, and how ADVPN shortcuts form and disappear.</li>
<li>A repeatable troubleshooting workflow with <code>diagnose vpn ike log filter</code> and the IKE debug.</li>
</ul>
<p><b>Prerequisites:</b> you know what an IP route is, you can read a FortiGate firewall policy, and you have seen BGP at a basic level. You do not need any earlier IPsec knowledge.</p>

<h3>Our story: Kaveri Retail</h3>
<p>Kaveri Retail has a head office in Chennai and two branches, Madurai and Trichy. All three reach the Internet through the shared network 203.0.113.0/24. The hub <b>HQ-FGT</b> is 203.0.113.1, <b>MDU-FGT</b> is .11 and <b>TRY-FGT</b> is .12. The office LANs are 10.10.0.0/24 (HQ), 10.20.0.0/24 (Madurai) and 10.30.0.0/24 (Trichy). Each LAN sits behind <code>port2</code> of its FortiGate, the PC is .10, and the FortiGate is .1. Over the Internet we build an <b>overlay</b> network 10.255.1.0/24: HQ is .1, Madurai .2, Trichy .3.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Kaveri Retail IPsec overlay">
<rect x="230" y="20" width="180" height="46" rx="23" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Internet 203.0.113.0/24</text>
<rect x="250" y="110" width="140" height="56" rx="10" fill="#bae6fd"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">.1 | LAN 10.10.0.0/24</text>
<rect x="30" y="170" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="105" y="194" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT</text><text x="105" y="212" text-anchor="middle" class="svg-muted" font-size="12">.11 | LAN 10.20.0.0/24</text>
<rect x="460" y="170" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="535" y="194" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT</text><text x="535" y="212" text-anchor="middle" class="svg-muted" font-size="12">.12 | LAN 10.30.0.0/24</text>
<line x1="320" y1="66" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="170" x2="270" y2="66" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="170" x2="370" y2="66" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="166" x2="170" y2="176" stroke="#0ea5e9" stroke-width="4"/>
<line x1="350" y1="166" x2="470" y2="176" stroke="#0ea5e9" stroke-width="4"/>
<text x="205" y="128" text-anchor="middle" class="svg-accent" font-size="12">TO-HQ tunnel</text>
<text x="440" y="128" text-anchor="middle" class="svg-accent" font-size="12">TO-HQ tunnel</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Overlay 10.255.1.0/24: HQ .1, MDU .2, TRY .3</text>
</svg><p class="cap">The thin lines are the physical path across the Internet; the thick blue lines are the encrypted tunnels that carry the overlay.</p></div>

<h3>Two kinds of security association</h3>
<p>A <b>security association (SA)</b> is a agreed set of keys and algorithms between two devices. IPsec on a FortiGate uses two layers:</p>
<dl class="terms">
<dt>IKE SA (phase 1)</dt><dd>A protected control channel between the two gateways. The peers prove who they are (here with a pre-shared key), agree on the encryption, hash and Diffie-Hellman group, and derive keys. One IKE SA per pair of gateways. It carries no user data.</dd>
<dt>Child SA (phase 2)</dt><dd>The protected lane for user traffic, created under the IKE SA. It is described by <b>selectors</b>, the source and destination networks it may carry. User packets travel inside it as ESP (exam theory: encapsulating security payload).</dd>
<dt>IKE</dt><dd>Internet Key Exchange, the protocol that builds both SAs over UDP port 500. In the lab we use IKEv2, which is why the log words are IKE_SA_INIT and IKE_AUTH.</dd>
</dl>
<p>On the FortiGate the two layers are two configuration objects. <code>config vpn ipsec phase1-interface</code> describes the IKE SA and also creates a <b>tunnel interface</b> of the same name. <code>config vpn ipsec phase2-interface</code> describes the child SA and refers to the phase 1 by name. In the lab the hub has phase 1 <code>KR-ADVPN</code> with phase 2 <code>KR-P2</code>, and each spoke has phase 1 <code>TO-HQ</code> with phase 2 <code>TO-HQ-P2</code>.</p>

<h3>Tunnels are interfaces, not policies</h3>
<p>Older books describe a "policy-based VPN", where a firewall policy says "encrypt this traffic". FortiGate in this course uses the <b>route-based</b> model: the tunnel is a real interface. You send traffic into it with a normal route and you permit it with a normal firewall policy that names the tunnel interface as source or destination. That means three things must all be true before a PC can use the VPN:</p>
<ol>
<li>The IKE SA and the child SA are up.</li>
<li>A route points the remote LAN at the tunnel interface.</li>
<li>A firewall policy allows the traffic to or from the tunnel interface.</li>
</ol>
<p>The policy is not just about user traffic. In the simulator, if a tunnel interface is not named in any firewall policy, the FortiGate ignores the incoming IKE request and logs <code>ignoring IKE request, no policy configured</code>.</p>

<h3>The life of one ping</h3>
<div class="eg"><p><b>Worked example.</b> PC-MDU (10.20.0.10) pings PC at HQ (10.10.0.10). The packet reaches MDU-FGT on port2. A route says 10.10.0.0/24 is reachable through the tunnel interface TO-HQ. Policy <code>LAN-TO-HQ</code> (port2 to TO-HQ) permits it. The FortiGate encrypts it into the child SA and sends it from 203.0.113.11 to 203.0.113.1. HQ-FGT decrypts it, checks the policy from the tunnel to port2, and delivers it. The IKE SA was only needed once, to make the lane.</p></div>

<h3>What the first check looks like</h3>
<p>The quickest health view is <code>get vpn ipsec tunnel summary</code>. On the hub, with both branches connected:</p>
<pre class="out">HQ-FGT # get vpn ipsec tunnel summary
'KR-ADVPN_0' 203.0.113.12:0  <span class="hl">selectors(total,up): 1/1</span>  rx(pkt,err): 12/0  tx(pkt,err): 12/0
'KR-ADVPN_1' 203.0.113.11:0  <span class="hl">selectors(total,up): 1/1</span>  rx(pkt,err): 9/0  tx(pkt,err): 9/0</pre>
<p>Read it left to right: the tunnel (instance) name, the remote gateway address, then <b>selectors(total,up)</b>. The first number is how many child SAs are configured; the second is how many are up. <code>1/1</code> is healthy. <code>1/0</code> means the IKE SA is up but the child SA is not, which is the signature of a phase 2 problem. Chapter 5 explains why the hub shows <code>KR-ADVPN_0</code> and <code>_1</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Treating "phase 1 up" as "VPN working". Phase 1 only proves the two gateways trust each other. Traffic flows only when a selector is up, a route exists and a policy permits it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Phase 1" and "phase 2" are the IKEv1 names. With IKEv2 the FortiGate still uses these words in the CLI, but the exchanges are IKE_SA_INIT, IKE_AUTH and CREATE_CHILD_SA. Do not mix the names up when you read a debug.</p></div>

<div class="scn"><h4>The ping that never leaves</h4><p>The Madurai manager says the VPN is down. The engineer opens <code>get vpn ipsec tunnel summary</code> on MDU-FGT and sees <code>selectors(total,up): 1/1</code>: both SAs are fine. Pings still fail. The routing table has no route for 10.10.0.0/24 through the tunnel, so the traffic leaves via the Internet default route and is dropped. After the route is fixed, pings work.</p><p><b>Lesson:</b> a green tunnel does not prove a working VPN. Check SAs, then route, then policy.</p></div>

<div class="iv"><p class="q">"Explain the difference between phase 1 and phase 2 in one minute."</p><p>Phase 1 builds the IKE SA: the gateways authenticate each other and agree on how to protect their own control traffic. Phase 2 builds the child SA under it: it carries the user data and is bound to selectors. Add that on a FortiGate each is a separate configuration object, and that you check them with <code>selectors(total,up)</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE SA (phase 1) is the control channel; the child SA (phase 2) carries user traffic.</li>
<li>Phase 1 creates a tunnel interface; phase 2 refers to it with <code>phase1name</code>.</li>
<li>Route-based VPN needs three things: SAs up, a route to the tunnel, a policy naming the tunnel.</li>
<li><code>selectors(total,up): 1/0</code> means phase 1 is up and phase 2 is not.</li>
<li>Kaveri Retail: hub HQ-FGT with KR-ADVPN, spokes MDU-FGT and TRY-FGT with TO-HQ, overlay 10.255.1.0/24.</li>
</ul></div>
`,hi:`
<p>Socho do company offices ek public road ke through keemti saaman bhejna chahte hain. Pehle dono security heads milte hain, ID cards dikhate hain aur ek secret language par agree karte hain. Yeh meeting slow aur careful hoti hai, aur kabhi-kabhi hi hoti hai. Uske baad armoured vans offices ke beech chalti hain, un keys ke saath jo dono heads ne decide ki thi. IPsec bhi aise hi kaam karta hai: ek slow, careful negotiation (<b>IKE SA</b>) aur phir asli traffic ke liye fast encrypted lanes (<b>child SA</b>, jise IPsec SA bhi kehte hain). Is module mein aap FortiGate par yeh poora system build, verify aur troubleshoot karna seekhoge, <b>ADVPN</b> ke saath, jo branches ko ek doosre se seedhe tunnels banane deta hai.</p>

<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>IKE aur IPsec kaise jude hain, aur VPN mein do tarah ke security association kyun hote hain.</li>
<li>Phase 1 aur phase 2 ke woh options jo NSE 7 exam puchta hai, aur mismatch hone par FortiGate ka exact behaviour.</li>
<li>Tunnel interface ko address kaise dete hain, routes kaise aate hain, aur overlay par BGP kaise chalta hai.</li>
<li>Dial-up hub aur static spokes kaise bante hain, aur ADVPN shortcuts kaise banti aur hatti hain.</li>
<li><code>diagnose vpn ike log filter</code> aur IKE debug ke saath ek repeatable troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites:</b> aapko pata ho IP route kya hota hai, FortiGate firewall policy padh sakte ho, aur BGP basic level par dekha ho. Pehle se IPsec aana zaroori nahi.</p>

<h3>Hamari kahani: Kaveri Retail</h3>
<p>Kaveri Retail ka head office Chennai mein hai aur do branches Madurai aur Trichy mein. Teeno Internet tak shared network 203.0.113.0/24 se pahunchte hain. Hub <b>HQ-FGT</b> 203.0.113.1 hai, <b>MDU-FGT</b> .11 hai aur <b>TRY-FGT</b> .12 hai. Office LANs 10.10.0.0/24 (HQ), 10.20.0.0/24 (Madurai) aur 10.30.0.0/24 (Trichy) hain. Har LAN apne FortiGate ke <code>port2</code> ke peeche hai, PC .10 hai aur FortiGate .1 hai. Internet ke upar hum ek <b>overlay</b> network 10.255.1.0/24 banate hain: HQ .1, Madurai .2, Trichy .3.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Kaveri Retail IPsec overlay">
<rect x="230" y="20" width="180" height="46" rx="23" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Internet 203.0.113.0/24</text>
<rect x="250" y="110" width="140" height="56" rx="10" fill="#bae6fd"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">.1 | LAN 10.10.0.0/24</text>
<rect x="30" y="170" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="105" y="194" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT</text><text x="105" y="212" text-anchor="middle" class="svg-muted" font-size="12">.11 | LAN 10.20.0.0/24</text>
<rect x="460" y="170" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="535" y="194" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT</text><text x="535" y="212" text-anchor="middle" class="svg-muted" font-size="12">.12 | LAN 10.30.0.0/24</text>
<line x1="320" y1="66" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="170" x2="270" y2="66" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="170" x2="370" y2="66" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="166" x2="170" y2="176" stroke="#0ea5e9" stroke-width="4"/>
<line x1="350" y1="166" x2="470" y2="176" stroke="#0ea5e9" stroke-width="4"/>
<text x="205" y="128" text-anchor="middle" class="svg-accent" font-size="12">TO-HQ tunnel</text>
<text x="440" y="128" text-anchor="middle" class="svg-accent" font-size="12">TO-HQ tunnel</text>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Overlay 10.255.1.0/24: HQ .1, MDU .2, TRY .3</text>
</svg><p class="cap">Patli lines Internet par physical path hain; moti neeli lines encrypted tunnels hain jo overlay carry karte hain.</p></div>

<h3>Do tarah ke security association</h3>
<p><b>Security association (SA)</b> do devices ke beech agree hui keys aur algorithms ka set hota hai. FortiGate par IPsec do layers use karta hai:</p>
<dl class="terms">
<dt>IKE SA (phase 1)</dt><dd>Dono gateways ke beech ek protected control channel. Peers apni pehchaan prove karte hain (yahan pre-shared key se), encryption, hash aur Diffie-Hellman group par agree karte hain, aur keys banate hain. Gateways ki ek jodi ke liye ek IKE SA. Isme user data nahi jaata.</dd>
<dt>Child SA (phase 2)</dt><dd>User traffic ke liye protected lane, jo IKE SA ke neeche banti hai. Ise <b>selectors</b> describe karte hain, yaani kaun se source aur destination networks yeh carry kar sakti hai. User packets ESP ke andar jaate hain (exam theory: encapsulating security payload).</dd>
<dt>IKE</dt><dd>Internet Key Exchange, woh protocol jo dono SAs UDP port 500 par banata hai. Lab mein hum IKEv2 use karte hain, isliye log mein IKE_SA_INIT aur IKE_AUTH words aate hain.</dd>
</dl>
<p>FortiGate par yeh do layers do configuration objects hain. <code>config vpn ipsec phase1-interface</code> IKE SA describe karta hai aur usi naam ka ek <b>tunnel interface</b> bhi banata hai. <code>config vpn ipsec phase2-interface</code> child SA describe karta hai aur phase 1 ko naam se refer karta hai. Lab mein hub par phase 1 <code>KR-ADVPN</code> aur phase 2 <code>KR-P2</code> hai, aur har spoke par phase 1 <code>TO-HQ</code> aur phase 2 <code>TO-HQ-P2</code> hai.</p>

<h3>Tunnels interface hote hain, policies nahi</h3>
<p>Purani books "policy-based VPN" batati hain, jahan firewall policy kehti hai "is traffic ko encrypt karo". Is course mein FortiGate <b>route-based</b> model use karta hai: tunnel ek asli interface hai. Traffic ko normal route se tunnel mein bhejte ho aur normal firewall policy se permit karte ho, jisme tunnel interface source ya destination hota hai. Matlab PC ko VPN use karne ke liye teen cheezein sach honi chahiye:</p>
<ol>
<li>IKE SA aur child SA up hon.</li>
<li>Koi route remote LAN ko tunnel interface par point kare.</li>
<li>Koi firewall policy tunnel interface se ya uske liye traffic allow kare.</li>
</ol>
<p>Policy sirf user traffic ke liye nahi hai. Simulator mein agar tunnel interface kisi firewall policy mein named nahi hai, to FortiGate incoming IKE request ko ignore karta hai aur <code>ignoring IKE request, no policy configured</code> log karta hai.</p>

<h3>Ek ping ki zindagi</h3>
<div class="eg"><p><b>Worked example.</b> PC-MDU (10.20.0.10) HQ ke PC (10.10.0.10) ko ping karta hai. Packet MDU-FGT ke port2 par aata hai. Ek route kehta hai ki 10.10.0.0/24 tunnel interface TO-HQ ke through reachable hai. Policy <code>LAN-TO-HQ</code> (port2 se TO-HQ) use permit karti hai. FortiGate use encrypt karke child SA mein daalta hai aur 203.0.113.11 se 203.0.113.1 ko bhejta hai. HQ-FGT decrypt karta hai, tunnel se port2 ki policy check karta hai, aur deliver karta hai. IKE SA ki zaroorat sirf ek baar thi, lane banane ke liye.</p></div>

<h3>Pehla check kaisa dikhta hai</h3>
<p>Sabse tez health view <code>get vpn ipsec tunnel summary</code> hai. Hub par, dono branches connected hone par:</p>
<pre class="out">HQ-FGT # get vpn ipsec tunnel summary
'KR-ADVPN_0' 203.0.113.12:0  <span class="hl">selectors(total,up): 1/1</span>  rx(pkt,err): 12/0  tx(pkt,err): 12/0
'KR-ADVPN_1' 203.0.113.11:0  <span class="hl">selectors(total,up): 1/1</span>  rx(pkt,err): 9/0  tx(pkt,err): 9/0</pre>
<p>Ise left se right padho: tunnel (instance) ka naam, remote gateway address, phir <b>selectors(total,up)</b>. Pehla number batata hai kitne child SAs configured hain; doosra batata hai kitne up hain. <code>1/1</code> healthy hai. <code>1/0</code> ka matlab IKE SA up hai lekin child SA nahi, jo phase 2 problem ki pehchaan hai. Chapter 5 batayega ki hub par <code>KR-ADVPN_0</code> aur <code>_1</code> kyun dikhte hain.</p>

<div class="warn"><p><b>Common mistake.</b> "Phase 1 up" ko "VPN working" samajh lena. Phase 1 sirf yeh prove karta hai ki dono gateways ek doosre par trust karte hain. Traffic tabhi chalta hai jab selector up ho, route ho aur policy permit kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Phase 1" aur "phase 2" IKEv1 ke naam hain. IKEv2 mein bhi FortiGate CLI mein yahi words use karta hai, lekin exchanges IKE_SA_INIT, IKE_AUTH aur CREATE_CHILD_SA hote hain. Debug padhte waqt naam mix mat karo.</p></div>

<div class="scn"><h4>Woh ping jo nikalti hi nahi</h4><p>Madurai ka manager kehta hai VPN down hai. Engineer MDU-FGT par <code>get vpn ipsec tunnel summary</code> kholta hai aur <code>selectors(total,up): 1/1</code> dekhta hai: dono SAs theek hain. Phir bhi pings fail hoti hain. Routing table mein 10.10.0.0/24 ke liye tunnel ka route nahi hai, isliye traffic Internet default route se nikalta hai aur drop ho jaata hai. Route theek karne ke baad pings chalti hain.</p><p><b>Lesson:</b> green tunnel ka matlab working VPN nahi hota. Pehle SAs, phir route, phir policy check karo.</p></div>

<div class="iv"><p class="q">"Phase 1 aur phase 2 ka fark ek minute mein samjhao."</p><p>Phase 1 IKE SA banata hai: gateways ek doosre ko authenticate karte hain aur apna control traffic protect karne ke tareeke par agree karte hain. Phase 2 uske neeche child SA banata hai: yeh user data carry karta hai aur selectors se bandha hota hai. Add karo ki FortiGate par dono alag configuration objects hain, aur aap unhe <code>selectors(total,up)</code> se check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IKE SA (phase 1) control channel hai; child SA (phase 2) user traffic carry karta hai.</li>
<li>Phase 1 tunnel interface banata hai; phase 2 <code>phase1name</code> se use refer karta hai.</li>
<li>Route-based VPN ko teen cheezein chahiye: SAs up, tunnel ka route, tunnel naam wali policy.</li>
<li><code>selectors(total,up): 1/0</code> ka matlab phase 1 up hai aur phase 2 nahi.</li>
<li>Kaveri Retail: hub HQ-FGT with KR-ADVPN, spokes MDU-FGT aur TRY-FGT with TO-HQ, overlay 10.255.1.0/24.</li>
</ul></div>
`}};export{e as default};