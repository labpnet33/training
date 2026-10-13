var e={id:`ipsec-auth`,h:{en:`Authentication: pre-shared keys, peer IDs and mode-cfg overview`,hi:`Authentication: pre-shared key, peer ID aur mode-cfg overview`},body:{en:`
<p>At the gate of the Chennai head office two checks happen. The guard first asks <i>"Which branch are you?"</i> and then asks for the secret word of the day. A visitor who gives a wrong name or a wrong word is turned away, but the guard writes a different reason in the register each time. IKE authentication works the same way. The two FortiGates exchange <b>identities</b> and then prove that they know the same secret. This chapter shows what each check is, how the lab reports a failure, and which parts of the exam story (certificates, EAP, mode-cfg) are theory only. It prepares task 2 of <b>n7-ipsec-down</b>, the pre-shared key typo.</p>

<h3>Pre-shared key (PSK)</h3>
<p>A <b>pre-shared key</b> is a secret typed identically on both units. In the Kaveri lab it is <code>Kaveri-IPsec-2026</code> in <code>set psksecret</code> on the hub template <code>KR-ADVPN</code> and on the spoke phase 1 <code>TO-HQ</code>. With IKEv2 the key is never sent. Each side uses it to compute a signed authentication value over the exchange, and the other side checks that value. If one character differs, the values differ and the exchange stops.</p>
<p>PSK is simple and ideal for a small retail network, but it has two weaknesses. First, one wrong character breaks the tunnel. Second, one key on a dial-up template is shared by every spoke, so rotating it means touching HQ-FGT, MDU-FGT and TRY-FGT in the same maintenance window. Use a long random key; a short dictionary word is a defensive weakness, not a feature.</p>

<h3>Peer IDs: who are you?</h3>
<p>Before the secret is checked, each unit sends an identity, its <b>local ID</b>. By default that identity is the IP address of the interface used for the tunnel. The receiver compares it with what it expects. On the phase 1 this is controlled by <code>peertype</code> (what kind of peer is accepted: <code>any</code> accepts every identity) and, for stricter types, a <code>peerid</code> value that must equal the other unit's <code>local-id</code>. A mismatch is logged as a <b>peer ID mismatch</b> and the negotiation ends.</p>
<p>The hub template of a dial-up VPN normally says <code>peertype any</code>, because it cannot list every future spoke. If you need to separate two spokes by name, give each spoke a distinct <code>local-id</code> and use a stricter peertype on the hub. Remember the lab check order: after the underlay, the firewall policy, the IKE version, the peertype/peerid against the local-id, then the proposals and DH, and only then the PSK. So an ID problem shows up <i>before</i> a PSK problem.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Order of IKE checks">
<rect x="20" y="30" width="100" height="56" rx="8" fill="#e2e8f0"/><text x="70" y="55" text-anchor="middle" class="svg-ink" font-size="12">UDP/500</text><text x="70" y="73" text-anchor="middle" class="svg-muted" font-size="12">reachable</text>
<rect x="135" y="30" width="100" height="56" rx="8" fill="#fed7aa"/><text x="185" y="55" text-anchor="middle" class="svg-ink" font-size="12">policy on</text><text x="185" y="73" text-anchor="middle" class="svg-muted" font-size="12">tunnel iface</text>
<rect x="250" y="30" width="100" height="56" rx="8" fill="#bae6fd"/><text x="300" y="55" text-anchor="middle" class="svg-ink" font-size="12">version +</text><text x="300" y="73" text-anchor="middle" class="svg-muted" font-size="12">peer ID</text>
<rect x="365" y="30" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="12">proposals</text><text x="415" y="73" text-anchor="middle" class="svg-muted" font-size="12">+ DH</text>
<rect x="480" y="30" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="12">PSK</text><text x="530" y="73" text-anchor="middle" class="svg-muted" font-size="12">then phase 2</text>
<text x="185" y="125" text-anchor="middle" class="svg-accent" font-size="12">ignoring IKE request</text>
<text x="415" y="125" text-anchor="middle" class="svg-accent" font-size="12">NO_PROPOSAL_CHOSEN</text>
<text x="530" y="125" text-anchor="middle" class="svg-accent" font-size="12">AUTHENTICATION_FAILED</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Each gate has its own message. The first failing gate stops the rest.</text>
</svg><p class="cap">The PSK is checked late; earlier gates fail with different messages.</p></div>

<h3>How a wrong PSK looks in the lab</h3>
<p>In lab <b>n7-ipsec-down</b> the second fault is a typo in the spoke key. The proposals already match, so the exchange reaches the authentication step and the hub refuses with the IKEv2 notify <code>AUTHENTICATION_FAILED</code>, which belongs to the <code>IKE_AUTH</code> exchange. Compare it with a proposal fault, which fails earlier in <code>IKE_SA_INIT</code> with <code>NO_PROPOSAL_CHOSEN</code>. Same symptom (tunnel down), different message, different fix.</p>
<pre class="code">TRY-FGT # diagnose vpn ike log filter name TO-HQ
TRY-FGT # diagnose debug application ike -1
TRY-FGT # diagnose debug enable
<span class="c">! reproduce, then stop and clean up</span>
TRY-FGT # diagnose debug disable
TRY-FGT # diagnose debug reset</pre>
<pre class="out">ike 0:TO-HQ:5: initiator: sent IKE_AUTH request
ike 0:TO-HQ:5: <span class="hl">received notify type AUTHENTICATION_FAILED</span>
ike 0:TO-HQ: negotiation failed</pre>
<p>The log filter limits the very verbose debug to one phase 1 name, here <code>TO-HQ</code>. Always set it before enabling debug and always run <code>diagnose debug disable</code> and <code>diagnose debug reset</code> afterwards. Fix the typo with <code>set psksecret Kaveri-IPsec-2026</code> on the spoke, clear the stale gateway with <code>diagnose vpn ike gateway clear name TO-HQ</code> and look at <code>get vpn ipsec tunnel summary</code> again. Do not paste the key into a ticket or a screenshot.</p>

<h3>Mode-cfg, XAuth, EAP and certificates (exam theory)</h3>
<p>The exam knows more authentication methods than the lab models. Keep these short definitions ready, but do not expect them in the simulator:</p>
<dl class="terms">
<dt>mode-cfg</dt><dd>The hub pushes settings (an address, DNS, routes) to a connecting client during IKE. Common for remote-access users; the Kaveri site-to-site design uses fixed tunnel IPs instead.</dd>
<dt>XAuth / EAP</dt><dd>An extra user-name and password step (IKEv1 XAuth, IKEv2 EAP) used for people, not for branch firewalls.</dd>
<dt>Certificates</dt><dd>Each side proves identity with a signed certificate instead of a shared secret. Scales better than one PSK for many sites and allows revocation.</dd>
<dt>NAT-T</dt><dd>UDP encapsulation when a NAT sits in front of a unit. It is exam theory here.</dd>
</dl>
<div class="note"><p>Honest scope: certificates, EAP/XAuth and NAT-T are not modelled in the lab. Only PSK authentication and the peer-ID logging are.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the PSK on the hub only. The already-connected spokes keep their old instances until they renegotiate, and then every one of them reports <code>AUTHENTICATION_FAILED</code>. Plan a rotation: change all units in one window, then clear the gateways.</p></div>

<div class="exam"><p><b>Exam trap.</b> Which notify means a wrong PSK? <code>AUTHENTICATION_FAILED</code>. Which means mismatched proposals? <code>NO_PROPOSAL_CHOSEN</code>. A wrong PSK together with a wrong proposal reports the proposal fault first, because the PSK is checked later.</p></div>

<div class="scn"><h4>The Friday key rotation</h4><p>Kaveri security changed the VPN key on HQ-FGT and MDU-FGT on Friday evening and forgot TRY-FGT. On Saturday morning Trichy store billing was offline. The hub debug showed <code>AUTHENTICATION_FAILED</code> for 203.0.113.12 while MDU stayed healthy. The engineer set the new key on TRY-FGT, cleared the gateway, and the instance returned within a minute.</p><p><b>Lesson:</b> a PSK change is a change on every unit; the notify text tells you at once that proposals were fine and only the secret differed.</p></div>

<div class="iv"><p class="q">"A tunnel is down. How do you know if it is the PSK or the proposals?"</p><p>Run the IKE log filter and debug for that phase 1. NO_PROPOSAL_CHOSEN in the first exchange means proposal or DH mismatch; AUTHENTICATION_FAILED in the second means key mismatch. Add that peer-ID mismatch is also logged separately.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSK must be identical on both ends; a mismatch gives <code>AUTHENTICATION_FAILED</code>.</li>
<li>Peer ID (local-id against peertype/peerid) is checked before the PSK; a mismatch is logged separately.</li>
<li>Dial-up templates use <code>peertype any</code> because future spokes are unknown.</li>
<li>Use the IKE log filter, enable debug, reproduce, then disable and reset.</li>
<li>Mode-cfg, EAP, XAuth, certificates and NAT-T are exam theory, not modelled in the lab.</li>
</ul></div>
`,hi:`
<p>Chennai head office ke gate par do checks hote hain. Guard pehle puchta hai <i>"Aap kaunsi branch ho?"</i> aur phir din ka secret word maangta hai. Galat naam ya galat word wale visitor ko wapas bhej diya jaata hai, par guard har baar register mein alag reason likhta hai. IKE authentication bhi aise hi kaam karta hai. Dono FortiGates <b>identities</b> exchange karte hain aur phir saabit karte hain ki unhe same secret pata hai. Yeh chapter dikhata hai ki har check kya hai, lab failure kaise report karta hai, aur exam ki kaunsi baatein (certificates, EAP, mode-cfg) sirf theory hain. Yeh <b>n7-ipsec-down</b> ke task 2, pre-shared key typo, ki taiyari hai.</p>

<h3>Pre-shared key (PSK)</h3>
<p><b>Pre-shared key</b> ek secret hai jo dono units par bilkul same type hota hai. Kaveri lab mein yeh hub template <code>KR-ADVPN</code> aur spoke phase 1 <code>TO-HQ</code> ke <code>set psksecret</code> mein <code>Kaveri-IPsec-2026</code> hai. IKEv2 mein key kabhi bheji nahi jaati. Har side use exchange par ek signed authentication value nikalne ke liye use karta hai, aur doosri side woh value check karti hai. Ek character bhi alag hua to values alag aati hain aur exchange ruk jaata hai.</p>
<p>PSK simple hai aur chhote retail network ke liye ideal, par iski do kamzoriyan hain. Pehli, ek galat character tunnel tod deta hai. Doosri, dial-up template par ek key saare spokes share karte hain, isliye rotate karne ke liye HQ-FGT, MDU-FGT aur TRY-FGT ko ek hi maintenance window mein chhoona padta hai. Lambi random key use karo; chhota dictionary word defensive kamzori hai, feature nahi.</p>

<h3>Peer IDs: aap kaun ho?</h3>
<p>Secret check hone se pehle har unit ek identity bhejta hai, apna <b>local ID</b>. Default mein yeh identity tunnel ke liye use hone wale interface ka IP address hoti hai. Receiver ise apni expectation se compare karta hai. Phase 1 par yeh <code>peertype</code> se control hota hai (kis type ka peer accept hoga: <code>any</code> har identity accept karta hai) aur stricter types ke liye <code>peerid</code> value jo doosre unit ke <code>local-id</code> ke barabar honi chahiye. Mismatch <b>peer ID mismatch</b> ke roop mein log hota hai aur negotiation khatam ho jaata hai.</p>
<p>Dial-up VPN ka hub template aam taur par <code>peertype any</code> rakhta hai, kyunki woh har future spoke ko list nahi kar sakta. Agar do spokes ko naam se alag karna ho to har spoke ko alag <code>local-id</code> do aur hub par stricter peertype use karo. Lab ka check order yaad rakho: underlay, firewall policy, IKE version, peertype/peerid against local-id, phir proposals aur DH, aur tab jaakar PSK. Isliye ID ki problem PSK ki problem se <i>pehle</i> dikhti hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Order of IKE checks">
<rect x="20" y="30" width="100" height="56" rx="8" fill="#e2e8f0"/><text x="70" y="55" text-anchor="middle" class="svg-ink" font-size="12">UDP/500</text><text x="70" y="73" text-anchor="middle" class="svg-muted" font-size="12">reachable</text>
<rect x="135" y="30" width="100" height="56" rx="8" fill="#fed7aa"/><text x="185" y="55" text-anchor="middle" class="svg-ink" font-size="12">policy on</text><text x="185" y="73" text-anchor="middle" class="svg-muted" font-size="12">tunnel iface</text>
<rect x="250" y="30" width="100" height="56" rx="8" fill="#bae6fd"/><text x="300" y="55" text-anchor="middle" class="svg-ink" font-size="12">version +</text><text x="300" y="73" text-anchor="middle" class="svg-muted" font-size="12">peer ID</text>
<rect x="365" y="30" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="415" y="55" text-anchor="middle" class="svg-ink" font-size="12">proposals</text><text x="415" y="73" text-anchor="middle" class="svg-muted" font-size="12">+ DH</text>
<rect x="480" y="30" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="12">PSK</text><text x="530" y="73" text-anchor="middle" class="svg-muted" font-size="12">phir phase 2</text>
<text x="185" y="125" text-anchor="middle" class="svg-accent" font-size="12">ignoring IKE request</text>
<text x="415" y="125" text-anchor="middle" class="svg-accent" font-size="12">NO_PROPOSAL_CHOSEN</text>
<text x="530" y="125" text-anchor="middle" class="svg-accent" font-size="12">AUTHENTICATION_FAILED</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Har gate ka apna message hai. Pehla fail hone wala gate baaki ko rok deta hai.</text>
</svg><p class="cap">PSK der se check hota hai; pehle ke gates alag messages ke saath fail hote hain.</p></div>

<h3>Lab mein galat PSK kaisa dikhta hai</h3>
<p>Lab <b>n7-ipsec-down</b> mein doosra fault spoke key mein typo hai. Proposals pehle se match karte hain, isliye exchange authentication step tak pahunchta hai aur hub IKEv2 notify <code>AUTHENTICATION_FAILED</code> ke saath mana kar deta hai, jo <code>IKE_AUTH</code> exchange ka hissa hai. Isse proposal fault se compare karo, jo pehle <code>IKE_SA_INIT</code> mein <code>NO_PROPOSAL_CHOSEN</code> ke saath fail hota hai. Symptom same (tunnel down), message alag, fix alag.</p>
<pre class="code">TRY-FGT # diagnose vpn ike log filter name TO-HQ
TRY-FGT # diagnose debug application ike -1
TRY-FGT # diagnose debug enable
<span class="c">! reproduce, then stop and clean up</span>
TRY-FGT # diagnose debug disable
TRY-FGT # diagnose debug reset</pre>
<pre class="out">ike 0:TO-HQ:5: initiator: sent IKE_AUTH request
ike 0:TO-HQ:5: <span class="hl">received notify type AUTHENTICATION_FAILED</span>
ike 0:TO-HQ: negotiation failed</pre>
<p>Log filter bahut verbose debug ko ek phase 1 naam, yahan <code>TO-HQ</code>, tak seemit karta hai. Debug enable karne se pehle hamesha filter set karo aur baad mein hamesha <code>diagnose debug disable</code> aur <code>diagnose debug reset</code> chalao. Typo ko spoke par <code>set psksecret Kaveri-IPsec-2026</code> se theek karo, purana gateway <code>diagnose vpn ike gateway clear name TO-HQ</code> se clear karo aur dobara <code>get vpn ipsec tunnel summary</code> dekho. Key ko ticket ya screenshot mein paste mat karo.</p>

<h3>Mode-cfg, XAuth, EAP aur certificates (exam theory)</h3>
<p>Exam lab se zyada authentication methods jaanta hai. Yeh chhoti definitions ready rakho, par simulator mein inki ummeed mat karo:</p>
<dl class="terms">
<dt>mode-cfg</dt><dd>Hub IKE ke dauran connecting client ko settings (address, DNS, routes) push karta hai. Remote-access users ke liye common hai; Kaveri ka site-to-site design iski jagah fixed tunnel IPs use karta hai.</dd>
<dt>XAuth / EAP</dt><dd>Extra user-name aur password step (IKEv1 XAuth, IKEv2 EAP), jo logon ke liye hai, branch firewalls ke liye nahi.</dd>
<dt>Certificates</dt><dd>Har side shared secret ki jagah signed certificate se identity saabit karta hai. Bahut sites ke liye ek PSK se behtar scale karta hai aur revocation possible hai.</dd>
<dt>NAT-T</dt><dd>Jab unit ke aage NAT ho to UDP encapsulation. Yahan yeh exam theory hai.</dd>
</dl>
<div class="note"><p>Honest scope: certificates, EAP/XAuth aur NAT-T lab mein model nahi hain. Sirf PSK authentication aur peer-ID logging hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> PSK sirf hub par badalna. Already-connected spokes apne purane instances tab tak rakhte hain jab tak renegotiate na karein, aur phir har ek <code>AUTHENTICATION_FAILED</code> report karta hai. Rotation plan karo: saari units ek window mein badlo, phir gateways clear karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Galat PSK ka notify kaunsa? <code>AUTHENTICATION_FAILED</code>. Mismatched proposals ka? <code>NO_PROPOSAL_CHOSEN</code>. Galat PSK aur galat proposal saath hon to pehle proposal fault report hota hai, kyunki PSK baad mein check hota hai.</p></div>

<div class="scn"><h4>Friday ki key rotation</h4><p>Kaveri security ne Friday shaam ko HQ-FGT aur MDU-FGT par VPN key badal di aur TRY-FGT bhool gaye. Saturday subah Trichy store ki billing offline thi. Hub debug mein 203.0.113.12 ke liye <code>AUTHENTICATION_FAILED</code> dikha jabki MDU healthy raha. Engineer ne TRY-FGT par nayi key set ki, gateway clear kiya, aur instance ek minute mein wapas aa gaya.</p><p><b>Lesson:</b> PSK change har unit par change hai; notify text turant batata hai ki proposals theek the aur sirf secret alag tha.</p></div>

<div class="iv"><p class="q">"Tunnel down hai. Kaise pata chalega ki PSK hai ya proposals?"</p><p>Us phase 1 ke liye IKE log filter aur debug chalao. Pehle exchange mein NO_PROPOSAL_CHOSEN ka matlab proposal ya DH mismatch; doosre mein AUTHENTICATION_FAILED ka matlab key mismatch. Yeh bhi jodo ki peer-ID mismatch alag se log hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSK dono ends par identical hona chahiye; mismatch <code>AUTHENTICATION_FAILED</code> deta hai.</li>
<li>Peer ID (local-id against peertype/peerid) PSK se pehle check hota hai; mismatch alag log hota hai.</li>
<li>Dial-up templates <code>peertype any</code> use karte hain kyunki future spokes unknown hain.</li>
<li>IKE log filter use karo, debug enable karo, reproduce karo, phir disable aur reset.</li>
<li>Mode-cfg, EAP, XAuth, certificates aur NAT-T exam theory hain, lab mein model nahi.</li>
</ul></div>
`}};export{e as default};