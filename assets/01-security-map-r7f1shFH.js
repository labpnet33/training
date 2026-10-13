var e={id:`security-map`,h:{en:`The WLAN security map: what each control protects`,hi:`WLAN security ka map: har control kya protect karta hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how to protect a Wi-Fi network beyond a single passphrase: guest web authentication, ACLs that keep guests away from corporate servers, VLANs and policies that come from a RADIUS server, MAC filtering, TrustSec tags, management frame protection, WPA3, the EAP methods behind 802.1X, rogue access points, and client exclusion. You will configure and verify the parts the five labs use on the Catalyst 9800-style controller (WLC1), and you will understand the rest as <b>concept only</b>: we explain it so you can reason about it and answer interview questions, but this simulator does not run it. The voice is defensive throughout: what an attack looks like to a defender, why it works, and which control stops it.</p>
<p><b>Prerequisites.</b> The module <b>wl-security</b> (WPA2/WPA3 personal, PSK on the 9800, 802.1X and RADIUS basics) and <b>wl-control</b> (WLAN, policy profile, policy tag, the profile-policy-tag model). We refer back to them and do not repeat them in depth. Lab note: the simulator is an original learning model, not Cisco software, and it is not a certification exam simulator.</p>

<h3>Analogy: an office building with four checks</h3>
<p>Think of a company building. A <b>lock on the front door</b> keeps casual strangers out (open versus secured Wi-Fi). A <b>reception desk</b> asks visitors to sign in before they walk to a meeting room (web authentication). A <b>badge</b> proves who each employee is (802.1X with a certificate or password). And <b>floor rules</b> decide which floors a visitor may enter (VLANs, ACLs, tags). Wi-Fi security is the same: four different questions answered by four different controls, and none of them answers all four.</p>

<h3>Four questions every WLAN must answer</h3>
<ul>
<li><b>Confidentiality:</b> can a neighbour with a radio read the traffic? Answered by encryption (WPA2 or WPA3 with AES-CCMP or GCMP, or OWE for open networks).</li>
<li><b>Identity:</b> who is this user or device? Answered by 802.1X (user or certificate), a passphrase (shared identity), a MAC address (weak identification), or a web login.</li>
<li><b>Access:</b> what may this identity reach? Answered by VLAN, ACL, QoS and, in a TrustSec design, a security group tag.</li>
<li><b>Management integrity:</b> can someone forge the frames that control the connection, for example a fake disconnect? Answered by management frame protection (PMF, 802.11w).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WLAN security options and what they protect">
<text x="20" y="22" class="svg-ink" font-size="13" font-weight="bold">Method</text>
<text x="190" y="22" class="svg-ink" font-size="13" font-weight="bold">Encrypts</text>
<text x="280" y="22" class="svg-ink" font-size="13" font-weight="bold">Identity</text>
<text x="400" y="22" class="svg-ink" font-size="13" font-weight="bold">Access control</text>
<rect x="10" y="30" width="620" height="32" rx="6" fill="#fed7aa"/><text x="20" y="51" class="svg-ink" font-size="12">Open (no security)</text><text x="190" y="51" class="svg-ink" font-size="12">no</text><text x="280" y="51" class="svg-ink" font-size="12">none</text><text x="400" y="51" class="svg-ink" font-size="12">none</text>
<rect x="10" y="66" width="620" height="32" rx="6" fill="#fde68a"/><text x="20" y="87" class="svg-ink" font-size="12">Open + web auth</text><text x="190" y="87" class="svg-ink" font-size="12">no</text><text x="280" y="87" class="svg-ink" font-size="12">web login</text><text x="400" y="87" class="svg-ink" font-size="12">VLAN + ACL after login</text>
<rect x="10" y="102" width="620" height="32" rx="6" fill="#e2e8f0"/><text x="20" y="123" class="svg-ink" font-size="12">MAC filtering (MAB)</text><text x="190" y="123" class="svg-ink" font-size="12">no</text><text x="280" y="123" class="svg-ink" font-size="12">MAC (weak)</text><text x="400" y="123" class="svg-ink" font-size="12">VLAN from list or RADIUS</text>
<rect x="10" y="138" width="620" height="32" rx="6" fill="#bae6fd"/><text x="20" y="159" class="svg-ink" font-size="12">WPA2/WPA3 Personal</text><text x="190" y="159" class="svg-ink" font-size="12">yes</text><text x="280" y="159" class="svg-ink" font-size="12">shared key</text><text x="400" y="159" class="svg-ink" font-size="12">one policy for all</text>
<rect x="10" y="174" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="20" y="195" class="svg-ink" font-size="12">WPA2/WPA3 Enterprise</text><text x="190" y="195" class="svg-ink" font-size="12">yes</text><text x="280" y="195" class="svg-ink" font-size="12">per user or device</text><text x="400" y="195" class="svg-ink" font-size="12">per-user VLAN, ACL, tag</text>
<text x="20" y="232" class="svg-muted" font-size="12">PMF (802.11w) is an add-on: it protects management frames on the secured rows.</text>
</svg><p class="cap">No single row answers all four questions. Real designs combine a method with an access policy.</p></div>

<h3>What each option does not protect</h3>
<p>Beginners often assume a login page means encrypted traffic. It does not. <b>Web authentication on an open WLAN</b> identifies the visitor at a captive page, but the radio frames are still readable by anyone nearby. A <b>MAC filter</b> only recognises an address, and addresses can be copied. A <b>shared passphrase</b> proves "knows the key", not "is Alice", so one leaked key exposes every user until you rotate it. <b>802.1X</b> gives real per-user identity, but only if the client validates the server certificate (chapter 8). Always ask "what is this control <i>not</i> doing?" before you rely on it.</p>

<h3>Where the controls live on the 9800</h3>
<p>You already know the model from wl-control: a <b>WLAN profile</b> holds the SSID and the security, a <b>policy profile</b> holds the VLAN and the policies, a <b>policy tag</b> joins them, and APs wear the tag. This module adds objects in each place:</p>
<table class="cmp"><tr><th>Where</th><th>Objects added in this module</th></tr>
<tr><td>Global config</td><td><code>parameter-map type webauth</code>, <code>aaa new-model</code>, login and authorization method lists, <code>username</code>, <code>ip access-list extended</code>, <code>wireless wps ...</code></td></tr>
<tr><td>WLAN profile</td><td><code>security web-auth</code>, <code>security pmf</code>, <code>mac-filtering</code></td></tr>
<tr><td>Policy profile</td><td><code>ipv4 acl</code>, <code>aaa-override</code>, <code>exclusionlist timeout</code></td></tr>
</table>
<p>Menu map for the web UI: <b>Configuration &gt; Security &gt; Web Auth</b>, <b>Configuration &gt; Security &gt; AAA</b>, <b>Configuration &gt; Security &gt; ACL</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags</b>, and <b>Monitoring &gt; Rogues</b>. Every web UI action turns into the same configuration commands you type in the CLI.</p>

<div class="eg"><p><b>Worked example.</b> A hotel needs three WLANs. <b>NK-GUEST</b>: open with web authentication, VLAN 50, ACL blocking internal servers. <b>NK-STAFF</b>: WPA2/WPA3 Enterprise with 802.1X, VLAN from RADIUS. <b>NK-IOT</b>: WPA2 PSK for cameras, MAC filtering used only as a hint. Three WLANs, three identity models, three access policies, one controller.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating "hidden SSID", "MAC filter" and "web login" as encryption. None of them encrypts anything. Another one: editing a WLAN or a policy profile while it is enabled. The 9800 refuses; use <code>shutdown</code>, edit, then <code>no shutdown</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often offer "web authentication" as a way to secure guest traffic over the air. It authenticates the user, it does not encrypt. Encryption on open guest networks is the job of OWE (concept only, chapter 7).</p></div>

<div class="scn"><h4>The hotel that trusted the login page</h4><p>A hotel ran an open guest WLAN with a captive page and told guests it was "secure". A security review used a laptop in monitor mode to show that a guest session was readable by anyone in the lobby. Nothing was broken; the design simply never encrypted the air. The hotel kept web authentication for terms acceptance, added OWE on supported releases, and told guests to rely on HTTPS-style protection inside their own applications.</p><p><b>Lesson:</b> name the control by what it really does. Web auth identifies, ACLs restrict, encryption protects.</p></div>

<div class="iv"><p class="q">"How would you secure a guest WLAN, a staff WLAN and an IoT WLAN differently?"</p><p>Guest: open (or OWE) with web authentication or consent, a dedicated VLAN, and an ACL that denies internal ranges. Staff: 802.1X with per-user policy and PMF. IoT: PSK or MAB with a separate VLAN and tight ACL. Explain that you start from the four questions (confidentiality, identity, access, management integrity) and pick controls per question.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every WLAN answers four questions: confidentiality, identity, access, management integrity.</li>
<li>Web auth, MAB and hidden SSIDs do not encrypt; WPA2/WPA3 or OWE do.</li>
<li>The profile, policy profile and policy tag model from wl-control is where all new controls attach.</li>
<li>Edit a WLAN or policy profile only while it is shut down.</li>
<li>Concept-only items (CWA with ISE, CoA, TrustSec, OWE, aWIPS) are explained but not simulated.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Wi-Fi network ko ek passphrase se aage kaise protect karte hain: guest web authentication, ACLs jo guests ko corporate servers se door rakhte hain, RADIUS server se aane wali VLANs aur policies, MAC filtering, TrustSec tags, management frame protection, WPA3, 802.1X ke peeche ke EAP methods, rogue access points aur client exclusion. Jo hissa paanch labs use karte hain, usse aap Catalyst 9800-style controller (WLC1) par configure aur verify karoge, aur baaki ko <b>concept only</b> ke taur par samjhoge: hum use isliye samjhate hain ki aap uske baare mein soch sako aur interview mein jawab de sako, lekin yeh simulator use run nahi karta. Poore module mein voice defensive hai: defender ko attack kaisa dikhta hai, woh kyun kaam karta hai, aur kaunsa control use rokta hai.</p>
<p><b>Prerequisites.</b> Module <b>wl-security</b> (WPA2/WPA3 personal, 9800 par PSK, 802.1X aur RADIUS basics) aur <b>wl-control</b> (WLAN, policy profile, policy tag, profile-policy-tag model). Hum inhe refer karte hain, depth mein dobara nahi padhate. Lab note: simulator ek original learning model hai, Cisco software nahi, aur certification exam simulator bhi nahi.</p>

<h3>Analogy: office building mein chaar checks</h3>
<p>Ek company ki building socho. <b>Front door ka lock</b> casual ajnabiyon ko bahar rakhta hai (open versus secured Wi-Fi). <b>Reception desk</b> visitors se meeting room jaane se pehle sign in karwata hai (web authentication). <b>Badge</b> har employee ki pehchaan proof karta hai (certificate ya password ke saath 802.1X). Aur <b>floor rules</b> tay karte hain ki visitor kaunsi floors mein ja sakta hai (VLANs, ACLs, tags). Wi-Fi security bhi aisi hi hai: chaar alag sawal, chaar alag controls, aur koi ek control chaaron ka jawab nahi deta.</p>

<h3>Har WLAN ko chaar sawalon ka jawab dena hota hai</h3>
<ul>
<li><b>Confidentiality:</b> kya paas ka koi radio wala traffic padh sakta hai? Jawab encryption (AES-CCMP ya GCMP ke saath WPA2 ya WPA3, ya open networks ke liye OWE).</li>
<li><b>Identity:</b> yeh user ya device kaun hai? Jawab 802.1X (user ya certificate), passphrase (shared identity), MAC address (kamzor identification), ya web login.</li>
<li><b>Access:</b> yeh identity kya reach kar sakti hai? Jawab VLAN, ACL, QoS aur TrustSec design mein security group tag.</li>
<li><b>Management integrity:</b> kya koi connection control karne wale frames forge kar sakta hai, jaise fake disconnect? Jawab management frame protection (PMF, 802.11w).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WLAN security options aur woh kya protect karte hain">
<text x="20" y="22" class="svg-ink" font-size="13" font-weight="bold">Method</text>
<text x="190" y="22" class="svg-ink" font-size="13" font-weight="bold">Encrypt</text>
<text x="280" y="22" class="svg-ink" font-size="13" font-weight="bold">Identity</text>
<text x="400" y="22" class="svg-ink" font-size="13" font-weight="bold">Access control</text>
<rect x="10" y="30" width="620" height="32" rx="6" fill="#fed7aa"/><text x="20" y="51" class="svg-ink" font-size="12">Open (no security)</text><text x="190" y="51" class="svg-ink" font-size="12">nahi</text><text x="280" y="51" class="svg-ink" font-size="12">koi nahi</text><text x="400" y="51" class="svg-ink" font-size="12">koi nahi</text>
<rect x="10" y="66" width="620" height="32" rx="6" fill="#fde68a"/><text x="20" y="87" class="svg-ink" font-size="12">Open + web auth</text><text x="190" y="87" class="svg-ink" font-size="12">nahi</text><text x="280" y="87" class="svg-ink" font-size="12">web login</text><text x="400" y="87" class="svg-ink" font-size="12">login ke baad VLAN + ACL</text>
<rect x="10" y="102" width="620" height="32" rx="6" fill="#e2e8f0"/><text x="20" y="123" class="svg-ink" font-size="12">MAC filtering (MAB)</text><text x="190" y="123" class="svg-ink" font-size="12">nahi</text><text x="280" y="123" class="svg-ink" font-size="12">MAC (kamzor)</text><text x="400" y="123" class="svg-ink" font-size="12">list ya RADIUS se VLAN</text>
<rect x="10" y="138" width="620" height="32" rx="6" fill="#bae6fd"/><text x="20" y="159" class="svg-ink" font-size="12">WPA2/WPA3 Personal</text><text x="190" y="159" class="svg-ink" font-size="12">haan</text><text x="280" y="159" class="svg-ink" font-size="12">shared key</text><text x="400" y="159" class="svg-ink" font-size="12">sabke liye ek policy</text>
<rect x="10" y="174" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="20" y="195" class="svg-ink" font-size="12">WPA2/WPA3 Enterprise</text><text x="190" y="195" class="svg-ink" font-size="12">haan</text><text x="280" y="195" class="svg-ink" font-size="12">per user ya device</text><text x="400" y="195" class="svg-ink" font-size="12">per-user VLAN, ACL, tag</text>
<text x="20" y="232" class="svg-muted" font-size="12">PMF (802.11w) add-on hai: secured rows par management frames protect karta hai.</text>
</svg><p class="cap">Koi ek row chaaron sawalon ka jawab nahi deta. Real designs method ke saath access policy milate hain.</p></div>

<h3>Har option kya protect nahi karta</h3>
<p>Beginners aksar maan lete hain ki login page ka matlab encrypted traffic hai. Aisa nahi hai. <b>Open WLAN par web authentication</b> visitor ko captive page par identify karta hai, lekin radio frames paas ke kisi ko bhi padhne ke liye available hain. <b>MAC filter</b> sirf address pehchaanta hai, aur address copy ho sakte hain. <b>Shared passphrase</b> "key pata hai" prove karta hai, "yeh Alice hai" nahi, isliye ek leak hui key rotate hone tak har user ko expose kar deti hai. <b>802.1X</b> asli per-user identity deta hai, lekin tabhi jab client server certificate validate kare (chapter 8). Kisi bhi control par bharosa karne se pehle poocho: "yeh control kya <i>nahi</i> kar raha?"</p>

<h3>9800 par controls kahan rehte hain</h3>
<p>Aap wl-control se model jaante ho: <b>WLAN profile</b> mein SSID aur security, <b>policy profile</b> mein VLAN aur policies, <b>policy tag</b> dono ko jodta hai, aur APs tag pehente hain. Yeh module har jagah kuch objects jodta hai:</p>
<table class="cmp"><tr><th>Kahan</th><th>Is module mein jude objects</th></tr>
<tr><td>Global config</td><td><code>parameter-map type webauth</code>, <code>aaa new-model</code>, login aur authorization method lists, <code>username</code>, <code>ip access-list extended</code>, <code>wireless wps ...</code></td></tr>
<tr><td>WLAN profile</td><td><code>security web-auth</code>, <code>security pmf</code>, <code>mac-filtering</code></td></tr>
<tr><td>Policy profile</td><td><code>ipv4 acl</code>, <code>aaa-override</code>, <code>exclusionlist timeout</code></td></tr>
</table>
<p>Web UI ka menu map: <b>Configuration &gt; Security &gt; Web Auth</b>, <b>Configuration &gt; Security &gt; AAA</b>, <b>Configuration &gt; Security &gt; ACL</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs | Policy | Tags</b> aur <b>Monitoring &gt; Rogues</b>. Web UI ka har action wahi configuration commands ban jata hai jo aap CLI mein type karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Ek hotel ko teen WLANs chahiye. <b>NK-GUEST</b>: open with web authentication, VLAN 50, ACL jo internal servers block kare. <b>NK-STAFF</b>: 802.1X ke saath WPA2/WPA3 Enterprise, VLAN RADIUS se. <b>NK-IOT</b>: cameras ke liye WPA2 PSK, MAC filtering sirf hint ke taur par. Teen WLANs, teen identity models, teen access policies, ek controller.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Hidden SSID", "MAC filter" aur "web login" ko encryption samajhna. Inme se koi kuch encrypt nahi karta. Ek aur galti: WLAN ya policy profile ko enabled rakhte hue edit karna. 9800 refuse karta hai; <code>shutdown</code> karo, edit karo, phir <code>no shutdown</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal aksar "web authentication" ko guest traffic secure karne ka tareeka bata dete hain. Woh user ko authenticate karta hai, encrypt nahi karta. Open guest networks par encryption OWE ka kaam hai (concept only, chapter 7).</p></div>

<div class="scn"><h4>Woh hotel jo login page par bharosa karta tha</h4><p>Ek hotel open guest WLAN captive page ke saath chalata tha aur guests ko bolta tha ki yeh "secure" hai. Security review mein monitor mode wale laptop se dikhaya gaya ki guest session lobby ka koi bhi padh sakta hai. Kuch toot-ta nahi tha; design ne hawa ko kabhi encrypt hi nahi kiya tha. Hotel ne terms acceptance ke liye web authentication rakha, supported releases par OWE joda, aur guests ko bola ki apni applications ke andar ki protection par bharosa karein.</p><p><b>Lesson:</b> control ka naam woh rakho jo woh asal mein karta hai. Web auth identify karta hai, ACL restrict karta hai, encryption protect karta hai.</p></div>

<div class="iv"><p class="q">"Guest WLAN, staff WLAN aur IoT WLAN ko aap alag alag tareeke se kaise secure karoge?"</p><p>Guest: open (ya OWE) web authentication ya consent ke saath, alag VLAN, aur ACL jo internal ranges deny kare. Staff: per-user policy aur PMF ke saath 802.1X. IoT: PSK ya MAB, alag VLAN aur tight ACL ke saath. Samjhao ki aap chaar sawalon (confidentiality, identity, access, management integrity) se shuru karte ho aur har sawal ke liye control chunte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har WLAN chaar sawalon ka jawab deta hai: confidentiality, identity, access, management integrity.</li>
<li>Web auth, MAB aur hidden SSID encrypt nahi karte; WPA2/WPA3 ya OWE karte hain.</li>
<li>wl-control ka profile, policy profile aur policy tag model woh jagah hai jahan saare naye controls lagte hain.</li>
<li>WLAN ya policy profile sirf shut down hone par edit karo.</li>
<li>Concept-only items (ISE ke saath CWA, CoA, TrustSec, OWE, aWIPS) samjhaye jaate hain lekin simulate nahi hote.</li>
</ul></div>
`}};export{e as default};