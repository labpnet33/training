var e={id:`topologies`,h:{en:`Site-to-site topologies in the Management Center`,hi:`Management Center mein site-to-site topologies`},body:{en:`
<p>On an ASA or an IOS router you type crypto maps line by line on each device. The Management Center works differently: you describe a <b>VPN topology</b> once, as a drawing with nodes and the networks behind them, and the Management Center generates the crypto configuration for every managed device in the drawing. This chapter explains the shapes of topology you can draw and what each piece of the wizard means.</p>

<h3>An analogy: a delivery route plan instead of separate parcels</h3>
<p>A small shop sends each parcel separately and writes the address every time. A logistics company draws a <b>route plan</b>: depot A, depot B, which goods move between them, which trucks and locks are used. Drivers at each depot just follow the plan. The Management Center topology is that route plan; the crypto maps on each Threat Defense are the drivers' instructions printed from it.</p>

<h3>Three topology shapes</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Point to point, hub and spoke, full mesh">
<circle cx="60" cy="100" r="22" fill="#fed7aa"/><text x="60" y="105" text-anchor="middle" class="svg-ink" font-size="12">A</text>
<circle cx="170" cy="100" r="22" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="12">B</text>
<line x1="82" y1="100" x2="148" y2="100" stroke="#64748b"/><text x="115" y="170" text-anchor="middle" class="svg-ink" font-size="13">Point to Point</text>
<circle cx="320" cy="100" r="22" fill="#fed7aa"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">Hub</text>
<circle cx="260" cy="40" r="18" fill="#bae6fd"/><circle cx="380" cy="40" r="18" fill="#bae6fd"/><circle cx="260" cy="150" r="18" fill="#bae6fd"/><circle cx="380" cy="150" r="18" fill="#bae6fd"/>
<line x1="304" y1="86" x2="272" y2="52" stroke="#64748b"/><line x1="336" y1="86" x2="368" y2="52" stroke="#64748b"/><line x1="304" y1="114" x2="272" y2="138" stroke="#64748b"/><line x1="336" y1="114" x2="368" y2="138" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Hub and Spoke</text>
<circle cx="480" cy="50" r="18" fill="#ddd6fe"/><circle cx="600" cy="50" r="18" fill="#ddd6fe"/><circle cx="480" cy="150" r="18" fill="#ddd6fe"/><circle cx="600" cy="150" r="18" fill="#ddd6fe"/>
<line x1="498" y1="50" x2="582" y2="50" stroke="#64748b"/><line x1="498" y1="150" x2="582" y2="150" stroke="#64748b"/><line x1="480" y1="68" x2="480" y2="132" stroke="#64748b"/><line x1="600" y1="68" x2="600" y2="132" stroke="#64748b"/><line x1="494" y1="62" x2="586" y2="138" stroke="#64748b"/><line x1="586" y1="62" x2="494" y2="138" stroke="#64748b"/>
<text x="540" y="190" text-anchor="middle" class="svg-ink" font-size="13">Full Mesh</text>
</svg><p class="cap">Tunnel count grows fastest in a full mesh: n(n-1)/2 tunnels for n sites.</p></div>
<ul><li><b>Point to Point</b>: exactly one Node A and one Node B. The classic HQ-to-branch or company-to-partner tunnel. The wizard refuses a second Node B ("A point-to-point topology has exactly one Node B").</li>
<li><b>Hub and Spoke</b>: one hub (usually the data center firewall) and many spokes. Spokes reach each other only through the hub. Easy to manage and to inspect centrally, but spoke-to-spoke traffic takes two tunnel hops.</li>
<li><b>Full Mesh</b>: every node builds a tunnel to every other node. Best latency between sites, but the number of tunnels grows as n(n-1)/2: 5 sites need 10 tunnels, 20 sites need 190. Full mesh exists only for policy-based VPNs. In the lab Management Center the <b>Network Topology</b> list offers Point to Point and Hub and Spoke; production releases also list Full Mesh.</li></ul>

<h3>Policy-based or route-based</h3>
<p>The <b>VPN Type</b> field decides how traffic is selected. <b>Policy Based (Crypto Map)</b> encrypts traffic that matches the protected networks: the Management Center turns them into a crypto ACL and binds a crypto map to the interface. <b>Route Based (VTI)</b> creates a virtual tunnel interface and encrypts whatever the routing table sends into it. Chapter 8 covers VTI in depth; the lab simulator models policy-based tunnels, which you meet most often with partners and older devices.</p>

<h3>Managed nodes and extranet nodes</h3>
<p>Each endpoint is either a device the Management Center manages, or an <b>extranet</b>: anything else (an IOS router, another vendor's firewall, a cloud VPN gateway). For a managed device the Management Center knows its interfaces, so it fills in the endpoint IP and can push matching configuration to both ends. For an extranet you type the peer's <b>Device Name</b> and <b>Endpoint IP Address</b> yourself, and the other team must configure their side to mirror yours.</p>

<h3>The four wizard steps</h3>
<p><b>Devices → VPN · Site To Site → Add</b> opens <b>Create New VPN Topology</b> with four tabs:</p>
<ol><li><b>1 · Endpoints</b>: Topology Name, Network Topology, VPN Type, IKE Version (IKEv1, IKEv2), Enabled; Node A Interface and Protected Networks; Node B Device (Extranet or a managed device), Device Name, Endpoint IP Address and Protected Networks.</li>
<li><b>2 · IKE</b>: Authentication Type (Pre-shared Manual Key or Certificate), Key and Confirm Key, and the IKEv2 Policies.</li>
<li><b>3 · IPsec</b>: IKEv2 IPsec Proposals, Enable Perfect Forward Secrecy with its Modulus Group, and Lifetime Duration (default 28800 seconds).</li>
<li><b>4 · Advanced</b>: Exempt VPN traffic from network address translation, and Bypass Access Control policy for decrypted traffic (sysopt permit-vpn).</li></ol>

<h3>What the Management Center generates</h3>
<p>After Deploy, the topology appears in the device configuration as familiar ASA-style commands with generated names:</p>
<pre class="code"><span class="c">! from > show running-config crypto (excerpt)</span>
access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0
crypto ipsec ikev2 ipsec-proposal CSM_IP_1
 protocol esp encryption aes-256 aes-192 aes
 protocol esp integrity sha-512 sha-384 sha-256 sha-1
crypto map CSM_outside_map 1 match address CSM_IPSEC_ACL_1
crypto map CSM_outside_map 1 set peer 198.51.100.2
crypto map CSM_outside_map 1 set ikev2 ipsec-proposal CSM_IP_1
crypto map CSM_outside_map 1 set security-association lifetime seconds 28800
crypto map CSM_outside_map 1 set reverse-route
crypto map CSM_outside_map interface outside
crypto ikev2 enable outside
tunnel-group 198.51.100.2 type ipsec-l2l</pre>
<p>Recognising these names helps when you troubleshoot from the CLI: <code>CSM_</code> objects always come from the Management Center, and you never edit them by hand on the device.</p>

<div class="eg"><p><b>Worked example.</b> A company has a data center firewall and 12 branch firewalls. As a hub-and-spoke topology this is 12 tunnels and one place to change the IKE policy. As a full mesh it would be 13 x 12 / 2 = 78 tunnels. The architect chooses hub and spoke for 10 small shops and adds a separate point-to-point topology between the two large branches that exchange video every day.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the remote LAN into Node A's protected networks (Node A lists <b>your</b> networks, Node B lists <b>theirs</b>); creating two topologies that protect the same pair of networks between the same peers; editing a topology and forgetting to Deploy to every device in it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Full mesh scales badly and is policy-based only; hub and spoke is the default answer for "many branches, central inspection". If a question mentions dynamic routing over the tunnel, the answer is route-based (VTI), not a crypto map.</p></div>

<div class="scn"><h4>The 190-tunnel surprise</h4><p>A logistics company with 20 warehouses chose Full Mesh "so every site can talk directly". Deploys started to take very long, every IKE policy change touched 190 tunnels, and the small warehouse firewalls hit their VPN peer limits. Looking at the traffic, the engineer found that 95% of the flows went to the data center anyway. He rebuilt it as hub and spoke with the data center Threat Defense as hub, plus one point-to-point topology between the two warehouses that shared a stock system. Deploy times dropped and the peer limits were no longer a concern.</p><p><b>Lesson:</b> choose the topology from the real traffic pattern, not from the idea that "direct is always better".</p></div>

<div class="iv"><p class="q">"When would you choose hub and spoke instead of full mesh on Threat Defense?"</p><p>Answer with numbers and reasons: full mesh needs n(n-1)/2 tunnels and every change touches all of them; hub and spoke needs n-1 tunnels, gives one inspection point at the hub, and fits when most traffic goes to the data center. Mention that spoke-to-spoke goes through the hub (two hops), and that for dynamic routing or many subnets you would move to route-based VTI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A topology describes nodes, their protected networks and the IKE/IPsec settings once; the Management Center generates the device configuration.</li>
<li>Point to Point = one peer; Hub and Spoke = central hub; Full Mesh = every pair, n(n-1)/2 tunnels, policy-based only.</li>
<li>Policy Based (Crypto Map) selects traffic by protected networks; Route Based (VTI) selects by routing.</li>
<li>Managed peers can receive a mirror configuration; extranet peers are configured by their own team.</li>
<li>Generated objects start with CSM_ and change only through the Management Center.</li>
</ul></div>
`,hi:`
<p>ASA ya IOS router par aap har device par line by line crypto maps type karte ho. Management Center alag tarah kaam karta hai: aap ek baar <b>VPN topology</b> describe karte ho, nodes aur unke peeche ke networks wali ek drawing ki tarah, aur Management Center drawing ke har managed device ke liye crypto configuration generate karta hai. Yeh chapter samjhata hai aap kaunse topology shapes bana sakte ho aur wizard ke har hisse ka kya matlab hai.</p>

<h3>Ek analogy: alag-alag parcels ki jagah delivery route plan</h3>
<p>Ek chhoti dukaan har parcel alag bhejti hai aur har baar address likhti hai. Ek logistics company <b>route plan</b> banati hai: depot A, depot B, unke beech kaunsa maal jaata hai, kaunse trucks aur locks use hote hain. Har depot ke drivers bas plan follow karte hain. Management Center topology wahi route plan hai; har Threat Defense par crypto maps usi se print hue drivers ke instructions hain.</p>

<h3>Teen topology shapes</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Point to point, hub and spoke, full mesh">
<circle cx="60" cy="100" r="22" fill="#fed7aa"/><text x="60" y="105" text-anchor="middle" class="svg-ink" font-size="12">A</text>
<circle cx="170" cy="100" r="22" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="12">B</text>
<line x1="82" y1="100" x2="148" y2="100" stroke="#64748b"/><text x="115" y="170" text-anchor="middle" class="svg-ink" font-size="13">Point to Point</text>
<circle cx="320" cy="100" r="22" fill="#fed7aa"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">Hub</text>
<circle cx="260" cy="40" r="18" fill="#bae6fd"/><circle cx="380" cy="40" r="18" fill="#bae6fd"/><circle cx="260" cy="150" r="18" fill="#bae6fd"/><circle cx="380" cy="150" r="18" fill="#bae6fd"/>
<line x1="304" y1="86" x2="272" y2="52" stroke="#64748b"/><line x1="336" y1="86" x2="368" y2="52" stroke="#64748b"/><line x1="304" y1="114" x2="272" y2="138" stroke="#64748b"/><line x1="336" y1="114" x2="368" y2="138" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Hub and Spoke</text>
<circle cx="480" cy="50" r="18" fill="#ddd6fe"/><circle cx="600" cy="50" r="18" fill="#ddd6fe"/><circle cx="480" cy="150" r="18" fill="#ddd6fe"/><circle cx="600" cy="150" r="18" fill="#ddd6fe"/>
<line x1="498" y1="50" x2="582" y2="50" stroke="#64748b"/><line x1="498" y1="150" x2="582" y2="150" stroke="#64748b"/><line x1="480" y1="68" x2="480" y2="132" stroke="#64748b"/><line x1="600" y1="68" x2="600" y2="132" stroke="#64748b"/><line x1="494" y1="62" x2="586" y2="138" stroke="#64748b"/><line x1="586" y1="62" x2="494" y2="138" stroke="#64748b"/>
<text x="540" y="190" text-anchor="middle" class="svg-ink" font-size="13">Full Mesh</text>
</svg><p class="cap">Full mesh mein tunnels ki ginti sabse tez badhti hai: n sites ke liye n(n-1)/2 tunnels.</p></div>
<ul><li><b>Point to Point</b>: bilkul ek Node A aur ek Node B. Classic HQ-se-branch ya company-se-partner tunnel. Wizard doosra Node B mana kar deta hai ("A point-to-point topology has exactly one Node B").</li>
<li><b>Hub and Spoke</b>: ek hub (aam taur par data center firewall) aur kai spokes. Spokes ek doosre tak sirf hub ke through pahunchte hain. Manage karna aur centrally inspect karna aasaan, par spoke-to-spoke traffic do tunnel hops leta hai.</li>
<li><b>Full Mesh</b>: har node har doosre node tak tunnel banata hai. Sites ke beech best latency, par tunnels ki ginti n(n-1)/2 se badhti hai: 5 sites ko 10 tunnels chahiye, 20 sites ko 190. Full mesh sirf policy-based VPN ke liye hai. Lab Management Center mein <b>Network Topology</b> list Point to Point aur Hub and Spoke offer karti hai; production releases Full Mesh bhi dikhate hain.</li></ul>

<h3>Policy-based ya route-based</h3>
<p><b>VPN Type</b> field tay karta hai traffic kaise select hoga. <b>Policy Based (Crypto Map)</b> us traffic ko encrypt karta hai jo protected networks se match karta hai: Management Center unhe crypto ACL mein badalta hai aur interface par crypto map bind karta hai. <b>Route Based (VTI)</b> ek virtual tunnel interface banata hai aur routing table jo bhi usmein bhejti hai use encrypt karta hai. Chapter 8 VTI ko detail mein cover karta hai; lab simulator policy-based tunnels model karta hai, jo partners aur purane devices ke saath sabse zyada milte hain.</p>

<h3>Managed nodes aur extranet nodes</h3>
<p>Har endpoint ya to Management Center ka managed device hota hai, ya <b>extranet</b>: baaki kuch bhi (IOS router, doosre vendor ka firewall, cloud VPN gateway). Managed device ke interfaces Management Center jaanta hai, isliye woh endpoint IP khud bhar deta hai aur dono ends par matching configuration push kar sakta hai. Extranet ke liye aap peer ka <b>Device Name</b> aur <b>Endpoint IP Address</b> khud type karte ho, aur doosri team ko apni side aapki mirror mein configure karni hoti hai.</p>

<h3>Wizard ke chaar steps</h3>
<p><b>Devices → VPN · Site To Site → Add</b> chaar tabs ke saath <b>Create New VPN Topology</b> kholta hai:</p>
<ol><li><b>1 · Endpoints</b>: Topology Name, Network Topology, VPN Type, IKE Version (IKEv1, IKEv2), Enabled; Node A ka Interface aur Protected Networks; Node B ka Device (Extranet ya managed device), Device Name, Endpoint IP Address aur Protected Networks.</li>
<li><b>2 · IKE</b>: Authentication Type (Pre-shared Manual Key ya Certificate), Key aur Confirm Key, aur IKEv2 Policies.</li>
<li><b>3 · IPsec</b>: IKEv2 IPsec Proposals, Modulus Group ke saath Enable Perfect Forward Secrecy, aur Lifetime Duration (default 28800 seconds).</li>
<li><b>4 · Advanced</b>: Exempt VPN traffic from network address translation, aur Bypass Access Control policy for decrypted traffic (sysopt permit-vpn).</li></ol>

<h3>Management Center kya generate karta hai</h3>
<p>Deploy ke baad topology device configuration mein generated names wale jaane-pehchaane ASA-style commands ki tarah dikhti hai:</p>
<pre class="code"><span class="c">! > show running-config crypto se (excerpt)</span>
access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0
crypto ipsec ikev2 ipsec-proposal CSM_IP_1
 protocol esp encryption aes-256 aes-192 aes
 protocol esp integrity sha-512 sha-384 sha-256 sha-1
crypto map CSM_outside_map 1 match address CSM_IPSEC_ACL_1
crypto map CSM_outside_map 1 set peer 198.51.100.2
crypto map CSM_outside_map 1 set ikev2 ipsec-proposal CSM_IP_1
crypto map CSM_outside_map 1 set security-association lifetime seconds 28800
crypto map CSM_outside_map 1 set reverse-route
crypto map CSM_outside_map interface outside
crypto ikev2 enable outside
tunnel-group 198.51.100.2 type ipsec-l2l</pre>
<p>In names ko pehchanna CLI se troubleshoot karte waqt madad karta hai: <code>CSM_</code> objects hamesha Management Center se aate hain, aur aap unhe device par kabhi haath se edit nahi karte.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke paas ek data center firewall aur 12 branch firewalls hain. Hub-and-spoke topology mein yeh 12 tunnels hain aur IKE policy badalne ki ek jagah. Full mesh mein yeh 13 x 12 / 2 = 78 tunnels hote. Architect 10 chhoti shops ke liye hub and spoke chunta hai aur un do badi branches ke beech ek alag point-to-point topology jodta hai jo roz video exchange karti hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Remote LAN ko Node A ke protected networks mein daal dena (Node A <b>aapke</b> networks list karta hai, Node B <b>unke</b>); same peers ke beech same networks ke pair ko protect karne wali do topologies banana; topology edit karke uske har device par Deploy karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Full mesh bura scale karta hai aur sirf policy-based hai; "kai branches, central inspection" ka default answer hub and spoke hai. Agar question tunnel par dynamic routing mention kare, to answer route-based (VTI) hai, crypto map nahi.</p></div>

<div class="scn"><h4>190 tunnels ka surprise</h4><p>20 warehouses wali ek logistics company ne Full Mesh chuna "taaki har site seedhe baat kar sake". Deploys mein bahut time lagne laga, har IKE policy change 190 tunnels ko chhoota tha, aur chhote warehouse firewalls apni VPN peer limits tak pahunch gaye. Traffic dekhne par engineer ne paaya ki 95% flows waise bhi data center jaate the. Usne data center Threat Defense ko hub banakar hub and spoke se rebuild kiya, plus un do warehouses ke beech ek point-to-point topology jo ek stock system share karte the. Deploy times gir gaye aur peer limits ki chinta khatam ho gayi.</p><p><b>Lesson:</b> topology real traffic pattern se chuno, is idea se nahi ki "direct hamesha behtar hai".</p></div>

<div class="iv"><p class="q">"Threat Defense par full mesh ki jagah hub and spoke kab chunoge?"</p><p>Numbers aur reasons ke saath answer do: full mesh ko n(n-1)/2 tunnels chahiye aur har change sab ko chhoota hai; hub and spoke ko n-1 tunnels chahiye, hub par ek inspection point deta hai, aur tab fit hota hai jab zyadatar traffic data center jaata hai. Mention karo ki spoke-to-spoke hub se jaata hai (do hops), aur dynamic routing ya bahut subnets ke liye aap route-based VTI par jaoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Topology ek baar nodes, unke protected networks aur IKE/IPsec settings describe karti hai; Management Center device configuration generate karta hai.</li>
<li>Point to Point = ek peer; Hub and Spoke = central hub; Full Mesh = har pair, n(n-1)/2 tunnels, sirf policy-based.</li>
<li>Policy Based (Crypto Map) protected networks se traffic select karta hai; Route Based (VTI) routing se.</li>
<li>Managed peers ko mirror configuration mil sakti hai; extranet peers apni team configure karti hai.</li>
<li>Generated objects CSM_ se shuru hote hain aur sirf Management Center se badalte hain.</li>
</ul></div>
`}};export{e as default};