var e={id:`big-picture`,h:{en:`What you will learn: mobility, anchoring and high availability`,hi:`Aap kya seekhoge: mobility, anchoring aur high availability`},body:{en:`
<p><b>What you will learn in this module.</b> A Wi-Fi client does not stay in one place. People walk from the lobby to the third floor, from one building to the next, and sometimes from one site served by one controller to another site served by a different controller. This module teaches how a Catalyst 9800 network lets that happen without dropping calls, how guests are kept away from the company LAN, and how the network survives when a controller or an access point loses its controller. By the end you will be able to build a mobility group, tell a Layer 2 roam from a Layer 3 roam, configure a guest anchor, give APs a controller list, explain HA SSO and N+1, and troubleshoot a mobility peer that stays Down.</p>
<p><b>Prerequisites.</b> You should have finished the module before this one (wl-roaming) so you know what a policy tag, a policy profile and a VLAN placement are, and wl-control so you know how an AP joins a controller with CAPWAP. Basic IP routing (static routes, DHCP) is assumed. This module previews topics that later modules deepen: FlexConnect (wl-flex), web authentication (wl-secure) and diagnostics (wl-diag).</p>

<h3>The analogy: one mobile number, many towers</h3>
<p>Think of your mobile phone. You buy the SIM in Mumbai, so Mumbai is your <b>home</b>. When you travel to Delhi your phone attaches to a Delhi tower, yet your number does not change and your friends still reach you. Behind the scenes the Delhi network (the <b>visited</b> network) and your home network agree to look after you, and your traffic can even be carried back through home.</p>
<p>Enterprise Wi-Fi works the same way. The controller where the client first joined is the <b>anchor</b> (home). The controller that now owns the radio the client sits on is the <b>foreign</b> controller (visited). Between them runs a <b>mobility tunnel</b>. The client keeps its IP address, so its sessions keep running. The rest of this module is the detail of that story.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two cities, two controllers, one mobility tunnel">
<rect x="10" y="20" width="270" height="200" rx="10" fill="#e2e8f0"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="14">Mumbai HQ</text>
<rect x="360" y="20" width="270" height="200" rx="10" fill="#e2e8f0"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="14">Delhi</text>
<rect x="95" y="58" width="100" height="34" rx="6" fill="#bae6fd"/><text x="145" y="80" text-anchor="middle" class="svg-ink" font-size="13">WLC1 10.10.99.10</text>
<rect x="445" y="58" width="100" height="34" rx="6" fill="#bae6fd"/><text x="495" y="80" text-anchor="middle" class="svg-ink" font-size="13">WLC2 10.20.99.10</text>
<rect x="40" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="190" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="220" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<rect x="390" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="420" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<rect x="540" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP4</text>
<line x1="145" y1="92" x2="70" y2="150" stroke="#64748b"/><line x1="145" y1="92" x2="220" y2="150" stroke="#64748b"/>
<line x1="495" y1="92" x2="420" y2="150" stroke="#64748b"/><line x1="495" y1="92" x2="570" y2="150" stroke="#64748b"/>
<line x1="195" y1="75" x2="445" y2="75" stroke="#7c3aed" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="65" text-anchor="middle" class="svg-accent" font-size="12">mobility tunnel</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">provider WAN</text>
<text x="145" y="205" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20: 10.10.20.0/24</text>
<text x="495" y="205" text-anchor="middle" class="svg-muted" font-size="12">VLAN 120: 10.20.20.0/24</text>
</svg><p class="cap">The lab topology: two cities, one controller each, two APs each, joined by a provider WAN circuit. The simulator uses two cities only as a model; in real life inter-controller roaming happens inside one campus or metro area.</p></div>

<h3>The map of this module</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2 and 3</td><td>Roaming recap, 802.11r, 802.11k, 802.11v</td><td>Concept only</td></tr>
<tr><td>4 and 5</td><td>Mobility group, peers, tunnels</td><td>wl-mob-group, wl-mob-peer-down, wl-mob-wan-down</td></tr>
<tr><td>6</td><td>Layer 2 and Layer 3 roam</td><td>wl-mob-roam</td></tr>
<tr><td>7</td><td>Anchoring and guest design</td><td>wl-mob-guest-anchor</td></tr>
<tr><td>8</td><td>AP failover and join priority</td><td>wl-mob-ap-failover (priority is concept only)</td></tr>
<tr><td>9 and 10</td><td>HA SSO, N+1, licensing</td><td>Concept only</td></tr>
<tr><td>11 and 12</td><td>Troubleshooting workflow, summary</td><td>All six labs combined</td></tr>
</table>

<div class="note"><p><b>Honest about the simulator.</b> Anything marked <b>concept only</b> is real Catalyst 9800 behaviour that the simulator does not model: HA SSO, N+1, licensing, 802.11r/k/v frames, AP join priority, NAT between mobility peers. You still need to know it for work and for the ENWLSI and ENWLSD blueprints, so we teach it with diagrams and sample output but never promise a lab for it. The simulator is an original learning model, not Cisco software.</p></div>

<h3>Where you will work: the web UI and the CLI</h3>
<p>Every lab can be solved in the 9800 web UI or on the CLI. The menu words used in this module are: <b>Configuration &gt; Wireless &gt; Mobility</b> (group name and peers), <b>Monitoring &gt; Mobility</b> (peer states, anchors), <b>Monitoring &gt; Wireless &gt; Clients</b> (a client's mobility role and roam type), <b>Monitoring &gt; Wireless &gt; Access Points</b>, and <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> for policy profiles. The web UI never does anything the CLI cannot do; it writes the same configuration. In the simulator the policy profile anchor settings are CLI only, and the lab hints say so.</p>

<div class="eg"><p><b>Worked example: the client's story.</b> Priya's laptop joins NK-STAFF near AP1 in Mumbai. WLC1 gives it 10.10.20.55 in VLAN 20. She walks to AP2 on the same controller: WLC1 simply moves her radio association (a Layer 2 roam, address kept). She then travels to Delhi and associates to AP3 on WLC2, where staff are in VLAN 120. WLC2 sees from the mobility group that WLC1 knows her, builds a tunnel back, and she keeps 10.10.20.55 (a Layer 3 roam). A guest in Delhi, by contrast, is tunnelled to Mumbai on purpose from the very first packet. Each of those sentences becomes a chapter.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating mobility as "just roaming". Roaming is what the client does (it chooses a new AP). Mobility is what the controllers do (they agree to hand over or tunnel the client's state). A client can roam perfectly well on a network with no mobility configuration at all, but it will then be treated as a brand new client and re-addressed.</p></div>

<div class="scn"><h4>The call that dropped at the stairwell</h4><p>A hospital moved nurses to VoIP badges. Every night shift, calls dropped when a nurse walked between the east and west wings. The wings were served by two controllers with different staff VLANs and no mobility group, so each walk was a hard roam: new association, new DHCP lease, session lost. The engineer built a mobility group, confirmed the peer was Up, and the next night the walk became a Layer 3 roam with the address kept. Calls stopped dropping.</p><p><b>Lesson:</b> the radio part of a roam is the easy bit. Keeping the client's identity (its IP address and session state) across controllers is what mobility is for.</p></div>

<div class="iv"><p class="q">"What is the difference between roaming and mobility on a Cisco wireless network?"</p><p>Strong answer: roaming is the client decision to move to another AP; mobility is the controller feature that lets controllers share client context over a tunnel so the client can keep its IP address when the new AP is on a different controller or subnet. Mention anchor and foreign roles and that mobility needs a group and a working tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming is a client decision; mobility is how controllers cooperate so the client keeps its identity.</li>
<li>Anchor is the home controller, foreign is the visited controller, joined by a mobility tunnel.</li>
<li>The labs use two cities: WLC1 (10.10.99.10) in Mumbai and WLC2 (10.20.99.10) in Delhi.</li>
<li>HA SSO, N+1, licensing, 802.11r/k/v and AP join priority are concept only in the simulator.</li>
<li>Use the web UI menus or the CLI; both write the same configuration.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Wi-Fi client ek jagah nahi rehta. Log lobby se teesri manzil tak jaate hain, ek building se doosri building tak jaate hain, aur kabhi kabhi ek controller ke site se doosre controller ke site tak. Yeh module sikhata hai ki Catalyst 9800 network yeh kaise hone deta hai bina calls drop kiye, guests ko company LAN se door kaise rakha jata hai, aur jab controller ya access point apna controller kho de to network kaise survive karta hai. End tak aap mobility group bana paoge, Layer 2 roam aur Layer 3 roam mein farak bata paoge, guest anchor configure kar paoge, APs ko controller list de paoge, HA SSO aur N+1 explain kar paoge, aur jo mobility peer Down rehta hai use troubleshoot kar paoge.</p>
<p><b>Prerequisites.</b> Is se pehle wala module (wl-roaming) complete hona chahiye taaki aapko pata ho policy tag, policy profile aur VLAN placement kya hote hain, aur wl-control taaki pata ho AP CAPWAP se controller kaise join karta hai. Basic IP routing (static routes, DHCP) maan liya gaya hai. Yeh module kuch topics ka preview deta hai jo aage ke modules gehraai se sikhate hain: FlexConnect (wl-flex), web authentication (wl-secure) aur diagnostics (wl-diag).</p>

<h3>Analogy: ek mobile number, kai towers</h3>
<p>Apne mobile phone ke baare mein socho. SIM aapne Mumbai mein li, to Mumbai aapka <b>home</b> hai. Delhi jaate ho to phone Delhi ke tower se attach hota hai, phir bhi number nahi badalta aur doston ke calls aate rehte hain. Peeche network (<b>visited</b> network) aur home network milkar aapka dhyaan rakhte hain, aur aapka traffic wapas home se bhi guzar sakta hai.</p>
<p>Enterprise Wi-Fi bilkul aise hi kaam karta hai. Jis controller par client pehli baar join hua woh <b>anchor</b> (home) hai. Jo controller ab client ke radio ka maalik hai woh <b>foreign</b> controller (visited) hai. Dono ke beech <b>mobility tunnel</b> chalta hai. Client apna IP address rakhta hai, isliye uske sessions chalte rehte hain. Is module ka baaki hissa isi kahani ki detail hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do shehar, do controllers, ek mobility tunnel">
<rect x="10" y="20" width="270" height="200" rx="10" fill="#e2e8f0"/><text x="145" y="42" text-anchor="middle" class="svg-ink" font-size="14">Mumbai HQ</text>
<rect x="360" y="20" width="270" height="200" rx="10" fill="#e2e8f0"/><text x="495" y="42" text-anchor="middle" class="svg-ink" font-size="14">Delhi</text>
<rect x="95" y="58" width="100" height="34" rx="6" fill="#bae6fd"/><text x="145" y="80" text-anchor="middle" class="svg-ink" font-size="13">WLC1 10.10.99.10</text>
<rect x="445" y="58" width="100" height="34" rx="6" fill="#bae6fd"/><text x="495" y="80" text-anchor="middle" class="svg-ink" font-size="13">WLC2 10.20.99.10</text>
<rect x="40" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="70" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="190" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="220" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<rect x="390" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="420" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<rect x="540" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="570" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP4</text>
<line x1="145" y1="92" x2="70" y2="150" stroke="#64748b"/><line x1="145" y1="92" x2="220" y2="150" stroke="#64748b"/>
<line x1="495" y1="92" x2="420" y2="150" stroke="#64748b"/><line x1="495" y1="92" x2="570" y2="150" stroke="#64748b"/>
<line x1="195" y1="75" x2="445" y2="75" stroke="#7c3aed" stroke-width="3" stroke-dasharray="6 4"/>
<text x="320" y="65" text-anchor="middle" class="svg-accent" font-size="12">mobility tunnel</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">provider WAN</text>
<text x="145" y="205" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20: 10.10.20.0/24</text>
<text x="495" y="205" text-anchor="middle" class="svg-muted" font-size="12">VLAN 120: 10.20.20.0/24</text>
</svg><p class="cap">Lab topology: do shehar, har ek mein ek controller aur do AP, provider WAN circuit se jude hue. Simulator mein do shehar sirf model hain; asli life mein inter-controller roaming ek campus ya metro area ke andar hoti hai.</p></div>

<h3>Is module ka map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2 aur 3</td><td>Roaming recap, 802.11r, 802.11k, 802.11v</td><td>Concept only</td></tr>
<tr><td>4 aur 5</td><td>Mobility group, peers, tunnels</td><td>wl-mob-group, wl-mob-peer-down, wl-mob-wan-down</td></tr>
<tr><td>6</td><td>Layer 2 aur Layer 3 roam</td><td>wl-mob-roam</td></tr>
<tr><td>7</td><td>Anchoring aur guest design</td><td>wl-mob-guest-anchor</td></tr>
<tr><td>8</td><td>AP failover aur join priority</td><td>wl-mob-ap-failover (priority concept only hai)</td></tr>
<tr><td>9 aur 10</td><td>HA SSO, N+1, licensing</td><td>Concept only</td></tr>
<tr><td>11 aur 12</td><td>Troubleshooting workflow, summary</td><td>Chhe ke chhe labs milake</td></tr>
</table>

<div class="note"><p><b>Simulator ke baare mein sach.</b> Jo kuch <b>concept only</b> likha hai woh asli Catalyst 9800 behaviour hai jo simulator model nahi karta: HA SSO, N+1, licensing, 802.11r/k/v frames, AP join priority, mobility peers ke beech NAT. Phir bhi aapko yeh kaam ke liye aur ENWLSI aur ENWLSD blueprints ke liye aana chahiye, isliye hum ise diagrams aur sample output se sikhate hain lekin iska lab ka vaada nahi karte. Simulator ek original learning model hai, Cisco software nahi.</p></div>

<h3>Aap kahan kaam karoge: web UI aur CLI</h3>
<p>Har lab web UI mein ya CLI par solve ho sakta hai. Is module mein jo menu words use hue hain: <b>Configuration &gt; Wireless &gt; Mobility</b> (group name aur peers), <b>Monitoring &gt; Mobility</b> (peer states, anchors), <b>Monitoring &gt; Wireless &gt; Clients</b> (client ka mobility role aur roam type), <b>Monitoring &gt; Wireless &gt; Access Points</b>, aur policy profiles ke liye <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b>. Web UI woh kuch nahi karta jo CLI nahi kar sakta; woh wahi configuration likhta hai. Simulator mein policy profile ke anchor settings sirf CLI se hote hain, aur lab hints yeh bolte hain.</p>

<div class="eg"><p><b>Worked example: client ki kahani.</b> Priya ka laptop Mumbai mein AP1 ke paas NK-STAFF join karta hai. WLC1 use VLAN 20 mein 10.10.20.55 deta hai. Woh same controller ke AP2 tak chalti hai: WLC1 bas uska radio association move karta hai (Layer 2 roam, address kept). Phir woh Delhi jaati hai aur WLC2 ke AP3 se associate hoti hai, jahan staff VLAN 120 mein hai. WLC2 mobility group se dekhta hai ki WLC1 use jaanta hai, tunnel banata hai, aur use 10.10.20.55 hi rehta hai (Layer 3 roam). Delhi ka guest, iske ulta, pehle hi packet se jaan boojh kar Mumbai tak tunnel hota hai. In mein se har ek vaakya ek chapter ban jaata hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Mobility ko sirf "roaming" samajhna. Roaming woh hai jo client karta hai (naya AP chunta hai). Mobility woh hai jo controllers karte hain (client ki state hand over ya tunnel karne par agree karte hain). Client bina kisi mobility configuration ke bhi roam kar sakta hai, lekin tab use bilkul naya client maana jata hai aur naya address milta hai.</p></div>

<div class="scn"><h4>Stairwell par drop hui call</h4><p>Ek hospital ne nurses ko VoIP badges diye. Har night shift mein east aur west wing ke beech chalte waqt calls drop hoti thi. Dono wings do controllers se serve hote the, staff VLANs alag the aur mobility group nahi tha, isliye har walk hard roam thi: naya association, naya DHCP lease, session lost. Engineer ne mobility group banaya, peer Up confirm kiya, aur agli raat walk Layer 3 roam ban gayi jisme address kept raha. Calls drop hona band ho gaya.</p><p><b>Lesson:</b> roam ka radio wala hissa aasaan hai. Controllers ke beech client ki identity (IP address aur session state) bachaye rakhna hi mobility ka kaam hai.</p></div>

<div class="iv"><p class="q">"Cisco wireless network par roaming aur mobility mein kya farak hai?"</p><p>Strong answer: roaming client ka decision hai ki woh doosre AP par move kare; mobility controller ka feature hai jo controllers ko tunnel ke upar client context share karne deta hai taaki client apna IP address rakhe jab naya AP doosre controller ya subnet par ho. Anchor aur foreign roles mention karo aur yeh ki mobility ko group aur chalta hua tunnel chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming client ka decision hai; mobility woh tareeka hai jisse controllers milkar client ki identity bachate hain.</li>
<li>Anchor home controller hai, foreign visited controller hai, dono mobility tunnel se jude hain.</li>
<li>Labs mein do shehar hain: Mumbai mein WLC1 (10.10.99.10) aur Delhi mein WLC2 (10.20.99.10).</li>
<li>HA SSO, N+1, licensing, 802.11r/k/v aur AP join priority simulator mein concept only hain.</li>
<li>Web UI menus ya CLI use karo; dono wahi configuration likhte hain.</li>
</ul></div>
`}};export{e as default};