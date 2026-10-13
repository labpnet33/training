var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This is your revision sheet for the IPsec site-to-site module. Use it the evening before the exam or an interview. If you can explain each item without notes, you are ready for the VPN questions of the NSE 4 exam and for real tunnel tickets.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain IKE, ESP, SAs and tunnel mode, and the ports and protocols used.</li>
<li>I can compare IKEv1 (main and aggressive) with IKEv2.</li>
<li>I can write a phase 1 interface with a strong proposal, DH group, DPD and NAT-T.</li>
<li>I can write a phase 2 interface with PFS and explain mirrored selectors.</li>
<li>I can route traffic into the tunnel and write the two policies, with NAT disabled.</li>
<li>I can explain the blackhole route and why it is added.</li>
<li>I can describe NAT traversal, DPD, certificates versus PSK, redundant tunnels and ADVPN.</li>
<li>I can verify a tunnel in layers and read the encrypt and decrypt counters.</li>
<li>I can run a filtered IKE debug and map messages to phase 1, phase 2 or a non-VPN cause.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IKE</dt><dd>Internet Key Exchange: authenticates peers and negotiates keys on UDP 500 and 4500.</dd>
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50; carries the encrypted data.</dd>
<dt>Phase 1 / IKE SA</dt><dd>The secure control channel built after peer authentication.</dd>
<dt>Phase 2 / child SA</dt><dd>The IPsec SAs that protect user traffic for the selectors.</dd>
<dt>Selector (proxy ID)</dt><dd>Local and remote subnets that define which traffic the SA protects.</dd>
<dt>PFS</dt><dd>Perfect Forward Secrecy: a fresh Diffie-Hellman exchange for each rekey.</dd>
<dt>NAT-T</dt><dd>NAT traversal: wraps ESP in UDP 4500 when NAT is detected.</dd>
<dt>DPD</dt><dd>Dead peer detection: probes the peer and tears down the SA when it stops answering.</dd>
<dt>Route-based VPN</dt><dd>A tunnel interface used with routes and policies.</dd>
<dt>ADVPN</dt><dd>Auto-Discovery VPN: spokes build direct tunnels on demand.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Phase 1 authenticates and builds the IKE SA; phase 2 builds the IPsec SAs.</li>
<li>The PSK or certificate is used in phase 1.</li>
<li>Phase 1 must agree on IKE version, credential, a common proposal and a DH group.</li>
<li>Selectors must mirror each other; wide selectors avoid most mismatches between FortiGates.</li>
<li>Route-based design needs a route to the tunnel interface and policies in both directions.</li>
<li>NAT-T uses UDP 4500; IKE uses UDP 500; ESP is protocol 50.</li>
<li>Phase 1 up and phase 2 down suggests a selector, proposal or PFS mismatch.</li>
<li>Encrypt rising and decrypt zero points to the remote side.</li>
<li>Recommended: IKEv2, AES-GCM or AES-256 with SHA-2, DH 14 or higher, PFS.</li>
</ul>

<h3>Command cheat-sheet (reference, not run in the simulator)</h3>
<pre class="code"><span class="c"># status</span>
get vpn ipsec tunnel summary
diagnose vpn ike gateway list
diagnose vpn tunnel list name to-BRANCH

<span class="c"># routing and test</span>
get router info routing-table details 10.20.0.30
execute ping-options source 10.10.0.1
execute ping 10.20.0.1

<span class="c"># sniffer and debug</span>
diagnose sniffer packet any 'host 198.51.100.10 and (port 500 or port 4500)' 4
diagnose vpn ike log filter name to-BRANCH
diagnose debug application ike -1
diagnose debug enable
diagnose debug disable</pre>

<h3>Where to practise next</h3>
<p>There is no FortiGate IPsec lab yet. Strengthen the building blocks where labs exist: interfaces in <b>nse4-setup</b>, objects and policies in <b>nse4-policy</b>, routes in <b>nse4-routing</b>, and the sniffer in <b>nse4-diag</b>. To compare designs read <b>sec-asa-vpn</b> and <b>sec-ftd-vpn</b>, and <b>sec-crypto</b> for the cryptography. The remote-access side is in <b>nse4-sslvpn</b>, and cluster behaviour in <b>nse4-ha</b>.</p>

<div class="eg"><p><b>Worked example for revision.</b> Phase 1 is established, phase 2 selectors are up, ping from HQ fails and the tunnel list shows encrypted packets rising and decrypted at zero. Where do you look first? The remote end: its route to the HQ subnet, its policy for the return direction, and any filter dropping the reply. If both counters were zero, you would check the local route and policy instead.</p></div>

<div class="warn"><p><b>Last mistakes to avoid.</b> Reading the green icon as proof of working traffic. Unmirrored selectors. No policy in one direction. Forgetting UDP 4500. Using weak crypto or one PSK everywhere.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which settings may differ between peers?" Lifetimes and DPD timers can differ. The IKE version, credential, proposals and DH group may not.</p></div>

<div class="scn"><h4>The handover that passed an audit</h4><p>A company handed over a new branch VPN with a one-page record: addressing plan, algorithm choices, mirrored configuration, test results including a failure test, and the owner of each secret. A later security review found nothing to correct, and the next branch was built in half the time by following the same sheet.</p><p><b>Lesson:</b> a tunnel is not finished until it is verified and documented.</p></div>

<div class="iv"><p class="q">"Give a one-minute summary of a good site-to-site design."</p><p>Route-based IPsec with IKEv2, AES-GCM or AES-256 with SHA-2, DH 19 or 20 and PFS. Certificates or unique long PSKs with peer ID checks. NAT-T and DPD on, a blackhole route behind the tunnel route, policies in both directions with NAT off, redundant tunnels over two ISPs with routing or SD-WAN, and a tested failover recorded in the runbook.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the roles of phase 1 and phase 2 and what must match in each.</li>
<li>Route and policy complete a route-based tunnel.</li>
<li>Verify with counters, not only the status icon.</li>
<li>Use modern crypto and strong authentication.</li>
<li>Troubleshoot in layers and change one thing at a time.</li>
</ul></div>
`,hi:`
<p>Yeh IPsec site-to-site module ki revision sheet hai. Ise exam ya interview se pehle shaam ko use karo. Har item ko bina notes ke explain kar sakte ho to aap NSE 4 exam ke VPN questions aur asli tunnel tickets ke liye ready ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main IKE, ESP, SAs aur tunnel mode, aur use hone wale ports aur protocols explain kar sakta hoon.</li>
<li>Main IKEv1 (main aur aggressive) ko IKEv2 se compare kar sakta hoon.</li>
<li>Main strong proposal, DH group, DPD aur NAT-T ke saath phase 1 interface likh sakta hoon.</li>
<li>Main PFS ke saath phase 2 interface likh sakta hoon aur mirrored selectors explain kar sakta hoon.</li>
<li>Main traffic ko tunnel mein route kar sakta hoon aur NAT disabled ke saath do policies likh sakta hoon.</li>
<li>Main blackhole route aur use add karne ka karan explain kar sakta hoon.</li>
<li>Main NAT traversal, DPD, certificates versus PSK, redundant tunnels aur ADVPN describe kar sakta hoon.</li>
<li>Main tunnel ko layers mein verify kar sakta hoon aur encrypt aur decrypt counters padh sakta hoon.</li>
<li>Main filtered IKE debug chalakar messages ko phase 1, phase 2 ya non-VPN cause se map kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>IKE</dt><dd>Internet Key Exchange: UDP 500 aur 4500 par peers ko authenticate karta hai aur keys negotiate karta hai.</dd>
<dt>ESP</dt><dd>Encapsulating Security Payload, IP protocol 50; encrypted data le jaata hai.</dd>
<dt>Phase 1 / IKE SA</dt><dd>Peer authentication ke baad bana secure control channel.</dd>
<dt>Phase 2 / child SA</dt><dd>IPsec SAs jo selectors ke liye user traffic protect karte hain.</dd>
<dt>Selector (proxy ID)</dt><dd>Local aur remote subnets jo tay karte hain ki SA kaun sa traffic protect karega.</dd>
<dt>PFS</dt><dd>Perfect Forward Secrecy: har rekey ke liye fresh Diffie-Hellman exchange.</dd>
<dt>NAT-T</dt><dd>NAT traversal: NAT detect hone par ESP ko UDP 4500 mein wrap karta hai.</dd>
<dt>DPD</dt><dd>Dead peer detection: peer ko probe karta hai aur jawab band hone par SA tod deta hai.</dd>
<dt>Route-based VPN</dt><dd>Routes aur policies ke saath use hone wala tunnel interface.</dd>
<dt>ADVPN</dt><dd>Auto-Discovery VPN: spokes on demand seedhe tunnels banate hain.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Phase 1 authenticate karta hai aur IKE SA banata hai; phase 2 IPsec SAs banata hai.</li>
<li>PSK ya certificate phase 1 mein use hota hai.</li>
<li>Phase 1 ko IKE version, credential, ek common proposal aur DH group par agree hona chahiye.</li>
<li>Selectors mirror hone chahiye; wide selectors FortiGates ke beech zyadatar mismatches rokte hain.</li>
<li>Route-based design ko tunnel interface ka route aur dono directions ki policies chahiye.</li>
<li>NAT-T UDP 4500 use karta hai; IKE UDP 500; ESP protocol 50.</li>
<li>Phase 1 up aur phase 2 down, selector, proposal ya PFS mismatch ka ishara hai.</li>
<li>Encrypt badhna aur decrypt zero, remote side ki taraf ishara karta hai.</li>
<li>Recommended: IKEv2, AES-GCM ya SHA-2 ke saath AES-256, DH 14 ya upar, PFS.</li>
</ul>

<h3>Command cheat-sheet (reference, simulator mein nahi chalaya)</h3>
<pre class="code"><span class="c"># status</span>
get vpn ipsec tunnel summary
diagnose vpn ike gateway list
diagnose vpn tunnel list name to-BRANCH

<span class="c"># routing aur test</span>
get router info routing-table details 10.20.0.30
execute ping-options source 10.10.0.1
execute ping 10.20.0.1

<span class="c"># sniffer aur debug</span>
diagnose sniffer packet any 'host 198.51.100.10 and (port 500 or port 4500)' 4
diagnose vpn ike log filter name to-BRANCH
diagnose debug application ike -1
diagnose debug enable
diagnose debug disable</pre>

<h3>Aage practice kahan karein</h3>
<p>Abhi FortiGate IPsec lab nahi hai. Building blocks wahan mazboot karo jahan labs hain: interfaces <b>nse4-setup</b> mein, objects aur policies <b>nse4-policy</b> mein, routes <b>nse4-routing</b> mein, aur sniffer <b>nse4-diag</b> mein. Designs compare karne ke liye <b>sec-asa-vpn</b> aur <b>sec-ftd-vpn</b> padho, aur cryptography ke liye <b>sec-crypto</b>. Remote-access side <b>nse4-sslvpn</b> mein hai, aur cluster behaviour <b>nse4-ha</b> mein.</p>

<div class="eg"><p><b>Revision ke liye worked example.</b> Phase 1 established hai, phase 2 selectors up hain, HQ se ping fail hota hai aur tunnel list encrypted packets badhte aur decrypted zero dikhati hai. Pehle kahan dekhoge? Remote end: HQ subnet ka uska route, return direction ki uski policy, aur reply drop karne wala koi filter. Dono counters zero hote to aap local route aur policy check karte.</p></div>

<div class="warn"><p><b>Aakhri mistakes jinse bachna hai.</b> Green icon ko working traffic ka saboot maan lena. Unmirrored selectors. Ek direction mein policy nahi. UDP 4500 bhool jaana. Weak crypto ya har jagah ek PSK.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Peers ke beech kaun si settings alag ho sakti hain?" Lifetimes aur DPD timers alag ho sakte hain. IKE version, credential, proposals aur DH group nahi.</p></div>

<div class="scn"><h4>Handover jo audit pass kar gaya</h4><p>Ek company ne naye branch VPN ka handover ek-page record ke saath diya: addressing plan, algorithm choices, mirrored configuration, failure test sameet test results, aur har secret ka owner. Baad ke security review mein sudharne layak kuch nahi mila, aur agla branch usi sheet ko follow karke aadhe time mein ban gaya.</p><p><b>Lesson:</b> tunnel tab tak khatam nahi jab tak verify aur document na ho.</p></div>

<div class="iv"><p class="q">"Achhe site-to-site design ka ek minute ka summary do."</p><p>Route-based IPsec, IKEv2, AES-GCM ya SHA-2 ke saath AES-256, DH 19 ya 20 aur PFS ke saath. Certificates ya unique lambi PSKs peer ID checks ke saath. NAT-T aur DPD on, tunnel route ke peeche blackhole route, NAT off ke saath dono directions ki policies, routing ya SD-WAN ke saath do ISPs par redundant tunnels, aur runbook mein record kiya tested failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 aur phase 2 ke roles aur har mein kya match hona chahiye, jaano.</li>
<li>Route aur policy route-based tunnel ko poora karte hain.</li>
<li>Sirf status icon nahi, counters se verify karo.</li>
<li>Modern crypto aur strong authentication use karo.</li>
<li>Layers mein troubleshoot karo aur ek baar mein ek cheez badlo.</li>
</ul></div>
`}};export{e as default};