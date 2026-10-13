var e={id:`roaming-types`,h:{en:`Roaming types: Layer 2, Layer 3, intra and inter-controller`,hi:`Roaming types: Layer 2, Layer 3, intra aur inter-controller`},body:{en:`
<h3>What is roaming, exactly?</h3>
<p>A wireless client is attached to one access point at a time. <b>Roaming</b> is the client moving its association from one AP (strictly, one BSSID, the radio MAC of an SSID on an AP) to another AP of the <b>same SSID</b> without the user having to sign in again. Three words matter here:</p>
<dl class="terms">
<dt>Association</dt><dd>The 802.11 link between client and AP. Roaming = a new association plus re-authentication, ideally a fast one.</dd>
<dt>Reassociation</dt><dd>The frame a client sends to the new AP that says "I was on another AP of this network, continue my session".</dd>
<dt>Mobility</dt><dd>The controller side: moving the client's state (keys, VLAN, session) so that the client keeps its IP address.</dd>
</dl>
<p>Always remember: <b>the client decides when to roam</b>. The AP and controller can publish information and give hints (later chapters), but the final decision lives in the client driver.</p>

<h3>Layer 2 roaming versus Layer 3 roaming</h3>
<p>The difference is about the client's IP subnet.</p>
<ul>
<li><b>Layer 2 roam:</b> the client's VLAN and subnet are the same before and after the move. The client keeps its IP address. No new DHCP. Sessions survive. This is what you want on one campus where both APs serve NK-STAFF in VLAN 20.</li>
<li><b>Layer 3 roam:</b> the client moves to an AP whose local network is a different subnet. If nothing special is done, the client would need a new address and every TCP session would break. To prevent that, the controllers build a tunnel and keep the client anchored to its original subnet (concept, see below).</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Layer 2 and Layer 3 roam">
<rect x="20" y="20" width="270" height="170" rx="10" fill="#e2e8f0"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">Layer 2 roam</text>
<rect x="40" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 VLAN 20</text>
<rect x="180" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="225" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP2 VLAN 20</text>
<line x1="130" y1="90" x2="180" y2="90" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="155" y="150" text-anchor="middle" class="svg-muted" font-size="12">same subnet, same IP</text>
<rect x="350" y="20" width="270" height="170" rx="10" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">Layer 3 roam (concept)</text>
<rect x="370" y="70" width="90" height="40" rx="8" fill="#fde68a"/><text x="415" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 VLAN 20</text>
<rect x="510" y="70" width="90" height="40" rx="8" fill="#fed7aa"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP9 VLAN 21</text>
<line x1="460" y1="90" x2="510" y2="90" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="485" y="150" text-anchor="middle" class="svg-muted" font-size="12">tunnel keeps old subnet</text>
</svg><p class="cap">Layer 2: nothing changes for the client. Layer 3: infrastructure must hide the subnet change.</p></div>

<h3>Intra-controller and inter-controller roaming</h3>
<p>This is a different axis: how many controllers are involved.</p>
<table class="cmp"><tr><th>Type</th><th>What changes</th><th>Notes</th></tr>
<tr><td>Intra-controller</td><td>Both APs are joined to the same WLC</td><td>The WLC already holds the client entry. Simple state update. This is every lab in this module (AP1 and AP2 on WLC1).</td></tr>
<tr><td>Inter-controller, Layer 2</td><td>APs on different WLCs, same VLAN</td><td>Controllers exchange client state through a <b>mobility group</b>. Client keeps IP.</td></tr>
<tr><td>Inter-controller, Layer 3</td><td>APs on different WLCs, different VLAN</td><td>Foreign controller tunnels traffic to the anchor controller. Client keeps IP (asymmetric or symmetric tunnelling).</td></tr></table>
<div class="note"><p><b>Not simulated in the lab.</b> The lab has one controller, WLC1. Mobility groups, mobility tunnels, anchor and foreign roles, and mobility peers are concepts only. Coming up: module wl-mobility (Mobility and high availability). You will not see a "mobility" command. You must still be able to explain them in an interview.</p></div>

<h3>Mobility groups and anchoring (concept)</h3>
<p>On the Catalyst 9800 a <b>mobility group</b> is a set of controllers that share client information and are configured as mobility peers. Inside a group, controllers can do inter-controller roaming for Layer 2 and Layer 3 cases. Peers authenticate each other and build a CAPWAP-based control tunnel and a data tunnel. When a client joins an AP on controller B but its session began on controller A, then A becomes the <b>anchor</b> and B the <b>foreign</b> controller. Traffic flows from the client to the AP, to B, through the tunnel to A and out to the wired network. The anchor is also the technique used for <b>guest anchoring</b>: guest traffic from many controllers terminates on one controller in the DMZ (see chapter 6).</p>

<h3>What a roam looks like on the controller</h3>
<p>On a single controller the visible result is simple: the client entry stays in the table and only the serving AP changes. In the lab you check this with <code>show wireless client summary</code>.</p>
<pre class="out">WLC1# show wireless client summary

Number of Local Clients: 1

MAC Address     AP Name           WLAN  State   Protocol  Method
0050.7966.6801  AP2               1     Run     11ac      PSK</pre>
<p>If the client was on AP1 a moment ago and is now on AP2 in the <span class="hl">same VLAN</span>, it was a clean Layer 2 intra-controller roam. If the VLAN column of <code>show wireless client mac-address &lt;mac&gt; detail</code> changed, the two APs do not share the same policy and you have a design fault, not a roam.</p>

<h3>Worked example</h3>
<div class="eg"><p>LAPTOP1 starts with 10.10.20.55 on AP1, VLAN 20. It moves toward AP2 and reassociates. If AP2 serves NK-STAFF through the same policy profile PP-STAFF, the laptop keeps 10.10.20.55 and a continuous ping to 10.10.60.20 loses at most a packet or two. If AP2 serves NK-STAFF through a different policy profile in VLAN 40, the laptop must DHCP again, gets 10.10.40.x, and every open session dies. The RF was identical in both cases. Only the policy differed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Blaming RF when the client changed subnet. (2) Believing the controller can "push" a client to a better AP; it can only suggest. (3) Mixing up mobility group (controllers) with RF group (RRM neighbours) and AP group.</p></div>
<div class="exam"><p><b>Exam trap.</b> Layer 2 versus Layer 3 roaming is about the client's subnet, not about the OSI layer of the AP uplink. Inter-controller does not automatically mean Layer 3.</p></div>

<div class="scn"><h4>Two controllers, one surprise</h4><p>A university adds a second WLC for a new building. Students walking between buildings keep their address but their throughput halves: the second WLC tunnels all their traffic back to the first. The design was a Layer 3 inter-controller roam with anchoring, working as intended but with a long path. The team later put both buildings on the same VLAN design to get Layer 2 roams.</p><p><b>Lesson:</b> know whether your roams are Layer 2 or Layer 3; the second is more complex and slower.</p></div>

<div class="iv"><p class="q">"What is the difference between intra-controller and inter-controller roaming?"</p><p>Intra: both APs on the same WLC, the WLC updates the client entry. Inter: different WLCs; they use mobility peers to move or tunnel client state. Add that Layer 2 versus Layer 3 depends on whether the client subnet changes, and that a Layer 3 roam needs anchoring to keep the IP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The client decides when to roam; infrastructure only assists.</li>
<li>Layer 2 roam keeps the subnet and IP; Layer 3 roam needs tunnelling to keep them.</li>
<li>Intra-controller is the simple case used in all labs.</li>
<li>Mobility groups and anchoring are concepts, not simulated in the lab.</li>
<li>A changed VLAN after a move is a policy problem, not a roam.</li>
</ul></div>
`,hi:`
<h3>Roaming exactly kya hai?</h3>
<p>Ek wireless client ek time par ek hi access point se attach hota hai. <b>Roaming</b> matlab client apna association ek AP (sahi shabdon mein, ek BSSID, yaani AP par SSID ka radio MAC) se doosre AP par le jaata hai, jo <b>same SSID</b> ka ho, bina user ko dobara sign in kiye. Teen shabd yaad rakho:</p>
<dl class="terms">
<dt>Association</dt><dd>Client aur AP ke beech 802.11 link. Roaming = naya association plus re-authentication, ideal roop mein fast wala.</dd>
<dt>Reassociation</dt><dd>Woh frame jo client naye AP ko bhejta hai aur kehta hai "main is network ke doosre AP par tha, mera session continue karo".</dd>
<dt>Mobility</dt><dd>Controller side: client ki state (keys, VLAN, session) ko move karna taaki client ka IP address same rahe.</dd>
</dl>
<p>Hamesha yaad rakho: <b>client decide karta hai ki kab roam karna hai</b>. AP aur controller information publish kar sakte hain aur hints de sakte hain (aage ke chapters), lekin final decision client driver mein hota hai.</p>

<h3>Layer 2 roaming versus Layer 3 roaming</h3>
<p>Fark client ke IP subnet ka hai.</p>
<ul>
<li><b>Layer 2 roam:</b> move se pehle aur baad client ka VLAN aur subnet same hai. Client ka IP address same rehta hai. Naya DHCP nahi. Sessions bach jaate hain. Ek campus par jahan dono APs VLAN 20 mein NK-STAFF serve karte hain, yahi chahiye.</li>
<li><b>Layer 3 roam:</b> client aise AP par jaata hai jiska local network alag subnet hai. Kuch special na kiya jaye to client ko naya address chahiye aur har TCP session toot jaayega. Isse bachne ke liye controllers tunnel banate hain aur client ko uske original subnet se anchored rakhte hain (concept, neeche dekho).</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Layer 2 and Layer 3 roam">
<rect x="20" y="20" width="270" height="170" rx="10" fill="#e2e8f0"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">Layer 2 roam</text>
<rect x="40" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 VLAN 20</text>
<rect x="180" y="70" width="90" height="40" rx="8" fill="#bae6fd"/><text x="225" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP2 VLAN 20</text>
<line x1="130" y1="90" x2="180" y2="90" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="155" y="150" text-anchor="middle" class="svg-muted" font-size="12">same subnet, same IP</text>
<rect x="350" y="20" width="270" height="170" rx="10" fill="#e2e8f0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">Layer 3 roam (concept)</text>
<rect x="370" y="70" width="90" height="40" rx="8" fill="#fde68a"/><text x="415" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 VLAN 20</text>
<rect x="510" y="70" width="90" height="40" rx="8" fill="#fed7aa"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP9 VLAN 21</text>
<line x1="460" y1="90" x2="510" y2="90" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="485" y="150" text-anchor="middle" class="svg-muted" font-size="12">tunnel purana subnet rakhta hai</text>
</svg><p class="cap">Layer 2: client ke liye kuch nahi badalta. Layer 3: infrastructure ko subnet change chhupana padta hai.</p></div>

<h3>Intra-controller aur inter-controller roaming</h3>
<p>Yeh alag axis hai: kitne controllers involved hain.</p>
<table class="cmp"><tr><th>Type</th><th>Kya badalta hai</th><th>Notes</th></tr>
<tr><td>Intra-controller</td><td>Dono APs same WLC par joined</td><td>WLC ke paas client entry pehle se hai. Simple state update. Is module ki har lab yahi hai (AP1 aur AP2 WLC1 par).</td></tr>
<tr><td>Inter-controller, Layer 2</td><td>APs alag WLCs par, same VLAN</td><td>Controllers <b>mobility group</b> se client state exchange karte hain. Client ka IP same rehta hai.</td></tr>
<tr><td>Inter-controller, Layer 3</td><td>APs alag WLCs par, alag VLAN</td><td>Foreign controller traffic ko anchor controller tak tunnel karta hai. Client ka IP same rehta hai.</td></tr></table>
<div class="note"><p><b>Not simulated in the lab.</b> Lab mein ek hi controller hai, WLC1. Mobility groups, mobility tunnels, anchor aur foreign roles, aur mobility peers sirf concepts hain. Aage aane wala module: wl-mobility (Mobility and high availability). Aapko koi "mobility" command nahi dikhegi. Phir bhi interview mein aapko inhe explain karna aana chahiye.</p></div>

<h3>Mobility groups aur anchoring (concept)</h3>
<p>Catalyst 9800 par <b>mobility group</b> controllers ka set hai jo client information share karte hain aur mobility peers ki tarah configured hote hain. Group ke andar controllers Layer 2 aur Layer 3 dono cases ke liye inter-controller roaming kar sakte hain. Peers ek doosre ko authenticate karte hain aur CAPWAP-based control tunnel aur data tunnel banate hain. Jab client controller B ke AP par join karta hai lekin uska session controller A par shuru hua tha, to A <b>anchor</b> ban jaata hai aur B <b>foreign</b> controller. Traffic client se AP, B, tunnel ke through A tak jaata hai aur wired network mein nikalta hai. Anchor wahi technique hai jo <b>guest anchoring</b> mein use hoti hai: kai controllers ka guest traffic DMZ ke ek controller par terminate hota hai (chapter 6 dekho).</p>

<h3>Controller par roam kaisa dikhta hai</h3>
<p>Ek controller par visible result simple hai: client entry table mein rehti hai aur sirf serving AP badalta hai. Lab mein aap isse <code>show wireless client summary</code> se check karte ho.</p>
<pre class="out">WLC1# show wireless client summary

Number of Local Clients: 1

MAC Address     AP Name           WLAN  State   Protocol  Method
0050.7966.6801  AP2               1     Run     11ac      PSK</pre>
<p>Agar client thodi der pehle AP1 par tha aur ab <span class="hl">same VLAN</span> mein AP2 par hai, to yeh clean Layer 2 intra-controller roam tha. Agar <code>show wireless client mac-address &lt;mac&gt; detail</code> ke VLAN column mein change aaya, to dono APs ki policy same nahi hai aur yeh design fault hai, roam nahi.</p>

<h3>Worked example</h3>
<div class="eg"><p>LAPTOP1 AP1 par VLAN 20 mein 10.10.20.55 se shuru karta hai. Woh AP2 ki taraf jaata hai aur reassociate karta hai. Agar AP2 NK-STAFF ko same policy profile PP-STAFF se serve karta hai, to laptop 10.10.20.55 rakhta hai aur 10.10.60.20 par continuous ping mein zyada se zyada ek-do packet jaate hain. Agar AP2 NK-STAFF ko alag policy profile se VLAN 40 mein serve karta hai, to laptop ko dobara DHCP karna padta hai, 10.10.40.x milta hai, aur har open session mar jaata hai. RF dono cases mein identical thi. Sirf policy alag thi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jab client ka subnet badla tab RF ko blame karna. (2) Maan lena ki controller client ko better AP par "push" kar sakta hai; woh sirf suggest kar sakta hai. (3) Mobility group (controllers) ko RF group (RRM neighbours) aur AP group se mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Layer 2 versus Layer 3 roaming client ke subnet ke baare mein hai, AP uplink ki OSI layer ke baare mein nahi. Inter-controller ka matlab automatically Layer 3 nahi hota.</p></div>

<div class="scn"><h4>Do controllers, ek surprise</h4><p>Ek university naye building ke liye doosra WLC add karti hai. Buildings ke beech chalne wale students ka address same rehta hai lekin throughput aadha ho jaata hai: doosra WLC unka saara traffic pehle WLC tak tunnel karta hai. Design Layer 3 inter-controller roam with anchoring tha, jo intended tarah kaam kar raha tha lekin lamba path leke. Baad mein team ne dono buildings ko same VLAN design par rakha taaki Layer 2 roams mile.</p><p><b>Lesson:</b> jaano ki aapke roams Layer 2 hain ya Layer 3; doosra complex aur slow hai.</p></div>

<div class="iv"><p class="q">"Intra-controller aur inter-controller roaming mein kya fark hai?"</p><p>Intra: dono APs same WLC par, WLC client entry update karta hai. Inter: alag WLCs; woh mobility peers se client state move ya tunnel karte hain. Add karo ki Layer 2 versus Layer 3 is par depend karta hai ki client subnet badla ya nahi, aur Layer 3 roam mein IP rakhne ke liye anchoring chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client decide karta hai kab roam karna hai; infrastructure sirf assist karta hai.</li>
<li>Layer 2 roam subnet aur IP rakhta hai; Layer 3 roam ko unhe rakhne ke liye tunnelling chahiye.</li>
<li>Intra-controller simple case hai jo saari labs mein use hota hai.</li>
<li>Mobility groups aur anchoring concepts hain, lab mein simulate nahi hote.</li>
<li>Move ke baad VLAN badalna policy problem hai, roam nahi.</li>
</ul></div>
`}};export{e as default};