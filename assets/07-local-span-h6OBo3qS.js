var e={id:`local-span`,h:{en:`SPAN concepts and the local SPAN lab`,hi:`SPAN concepts aur local SPAN lab`},body:{en:`
<p>A switch is a very discreet postman: it delivers each letter only to the house on the envelope. That is great for privacy and performance, but terrible for an investigator standing on the street with a notebook, who sees almost nothing. <b>SPAN</b> (Switched Port Analyzer), also called <b>port mirroring</b>, asks the postman to photocopy selected letters and drop the copies in the investigator's mailbox, without delaying the originals.</p>

<h3>Why you need port mirroring</h3>
<p>A switch forwards a known unicast frame only out of the port where the destination MAC was learned. A laptop running Wireshark on a spare port therefore sees only broadcasts, unknown unicasts and its own traffic. To capture a conversation between two other hosts, or to feed an IDS, a recorder or an application performance monitor, the switch must copy the traffic to that port.</p>

<h3>Terms</h3>
<dl class="terms">
<dt>Source</dt><dd>What is copied: one or more ports (including port-channels) or whole VLANs. Each source has a <b>direction</b>: <code>rx</code> (received by the switch on that port), <code>tx</code> (sent by the switch out of that port) or <code>both</code> (the default).</dd>
<dt>Destination</dt><dd>The port that receives the copies, where the analyser is connected. It becomes a <b>monitor port</b>.</dd>
<dt>Session</dt><dd>A numbered pairing of sources and a destination, for example <code>monitor session 1</code>.</dd>
</dl>

<h3>What happens to the destination port</h3>
<ul>
<li>It stops acting as a normal switchport: it does not learn MAC addresses and does not take part in spanning tree while the session is active.</li>
<li>By default it <b>does not accept</b> traffic from the attached device. Some analysers or IDS sensors need to send (for example TCP resets); the <code>ingress</code> option allows that on supported platforms.</li>
<li>Copies are sent untagged (native) by default. <code>encapsulation replicate</code> keeps the original 802.1Q tags, which is useful when the source is a trunk.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Local SPAN lab topology">
<rect x="230" y="30" width="180" height="60" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="12">monitor session 1</text>
<rect x="20" y="170" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.11</text>
<rect x="170" y="170" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="230" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="230" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.12</text>
<rect x="330" y="170" width="120" height="50" rx="8" fill="#fde68a"/><text x="390" y="192" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="390" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.100</text>
<rect x="490" y="170" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="192" text-anchor="middle" class="svg-ink" font-size="13">SNIFFER</text><text x="555" y="210" text-anchor="middle" class="svg-muted" font-size="12">monitor port</text>
<line x1="260" y1="90" x2="80" y2="170" stroke="#64748b" stroke-width="2"/><text x="140" y="120" class="svg-accent" font-size="12">Gi0/1 rx</text>
<line x1="300" y1="90" x2="230" y2="170" stroke="#64748b" stroke-width="2"/><text x="225" y="140" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="340" y1="90" x2="390" y2="170" stroke="#64748b" stroke-width="2"/><text x="370" y="140" class="svg-accent" font-size="12">Gi0/3 both</text>
<line x1="380" y1="90" x2="555" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="490" y="120" class="svg-accent" font-size="12">Gi0/7 dest</text>
</svg><p class="cap">The local SPAN lab: SRV1 in both directions and PC1 received traffic are copied to SNIFFER on Gi0/7.</p></div>

<h3>Lab walkthrough: local SPAN</h3>
<p>The billing server SRV1 on SW1 Gi0/3 is suspected of talking to hosts it should not. The security team connected a capture laptop (SNIFFER) to Gi0/7. PC1 is on Gi0/1, PC2 on Gi0/2, all in VLAN 10 (10.70.0.0/24).</p>
<pre class="code">SW1# configure terminal
SW1(config)# monitor session 1 source interface g0/3            <span class="c">! both is the default</span>
SW1(config)# monitor session 1 destination interface g0/7
SW1(config)# monitor session 1 source interface g0/1 rx         <span class="c">! PC1: received only</span>
SW1(config)# end</pre>
<p>Now generate traffic: PC1 pings SRV1 at 10.70.0.100. The SNIFFER sees the echo requests (received on Gi0/1 and sent out of Gi0/3) and the echo replies (received on Gi0/3). Note that a frame that matches two sources, like PC1's request here, is still copied only once per session.</p>
<pre class="out">SW1# show monitor session 1
Session 1
---------
Type                     : <span class="hl">Local Session</span>
Source Ports             :
    <span class="hl">RX Only              : Gi0/1</span>
    <span class="hl">Both                 : Gi0/3</span>
<span class="hl">Destination Ports        : Gi0/7</span>
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>Remove the session with <code>no monitor session 1</code>; Gi0/7 then returns to its normal access port configuration.</p>

<h3>Restrictions to remember</h3>
<ul>
<li>A port cannot be a source and a destination at the same time, and a destination belongs to one session only.</li>
<li>The number of sessions per switch is small and platform dependent. Check before promising a mirror to a new team.</li>
<li>Mixing port sources and VLAN sources in one session is not allowed on many platforms.</li>
<li>Oversubscription: copies that do not fit into the destination port are <b>dropped</b>. SPAN never slows the original traffic, but it can lose copies.</li>
<li>Filters: when a trunk is a source, <code>monitor session 1 filter vlan 10</code> limits which VLANs are copied.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> SRV1 runs at 1 Gbps and at peak receives 700 Mbps and sends 600 Mbps. Mirroring it in both directions produces 1.3 Gbps of copies, but the SNIFFER port is 1 Gbps. About 300 Mbps of copies are dropped and the capture shows gaps and false "TCP retransmission" hints. Fix: mirror only <code>rx</code>, use a 10 Gbps destination port, or filter to the VLANs you need.</p></div>

<div class="warn"><p><b>Common mistake.</b> Choosing an uplink or a port with a user on it as the destination. The moment the session is configured, the port stops forwarding normal traffic and the user or uplink goes silent. Always pick a dedicated, labelled port.</p></div>

<div class="exam"><p><b>Exam trap.</b> Without a keyword the direction is <code>both</code>. <code>rx</code> means traffic <i>received by the switch</i> on the source port, which is traffic <i>sent by</i> the attached host. Many candidates reverse this.</p></div>

<div class="scn"><h4>The IDS that saw only half of every conversation</h4><p>An IDS reported thousands of "TCP handshake incomplete" alerts after it was connected to a SPAN port. The engineer ran <code>show monitor session 1</code> and saw the uplink as "RX Only": someone had copied a template meant for another switch. The IDS was seeing only inbound packets and never the replies. Changing the source to <code>both</code> (and upgrading the destination to 10 Gbps to avoid oversubscription) made the alerts disappear.</p><p><b>Lesson:</b> security tools need both directions of a conversation; check the direction in the session output.</p></div>

<div class="iv"><p class="q">"What happens to a port when you make it a SPAN destination?"</p><p>It becomes a monitor port: it transmits only the copies, stops normal switching, does not learn MACs and does not participate in spanning tree while the session is active. By default it drops traffic sent by the analyser unless ingress is enabled. Mention that copies may be dropped if the sources exceed the destination speed, but the originals are never affected.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN copies traffic from source ports or VLANs to a destination port for analysis; originals are untouched.</li>
<li>Directions: rx, tx, both (default).</li>
<li>The destination becomes a monitor port: no MAC learning, no STP, no ingress by default.</li>
<li>Verify with <code>show monitor session N</code>: type, RX Only / TX Only / Both, destination ports.</li>
<li>Watch oversubscription: excess copies are dropped at the destination.</li>
</ul></div>
`,hi:`
<p>Switch ek bahut discreet postman hai: har chitthi sirf usi ghar par deta hai jiska pata envelope par hai. Privacy aur performance ke liye yeh badhiya hai, par street par notebook lekar khade investigator ke liye bekaar, jise lagbhag kuch nahi dikhta. <b>SPAN</b> (Switched Port Analyzer), jise <b>port mirroring</b> bhi kehte hain, postman se kehta hai ki chuni hui chitthiyon ki photocopy karke copies investigator ke mailbox mein daal do, originals ko late kiye bina.</p>

<h3>Port mirroring ki zaroorat kyun</h3>
<p>Switch known unicast frame ko sirf us port se bahar bhejta hai jahan destination MAC seekha gaya tha. Isliye spare port par Wireshark chalane wale laptop ko sirf broadcasts, unknown unicasts aur apna traffic dikhta hai. Do doosre hosts ki conversation capture karne ke liye, ya IDS, recorder ya application performance monitor ko feed karne ke liye, switch ko traffic us port par copy karna padega.</p>

<h3>Terms</h3>
<dl class="terms">
<dt>Source</dt><dd>Kya copy hota hai: ek ya zyada ports (port-channels bhi) ya poore VLANs. Har source ki ek <b>direction</b> hoti hai: <code>rx</code> (switch ne us port par receive kiya), <code>tx</code> (switch ne us port se bahar bheja) ya <code>both</code> (default).</dd>
<dt>Destination</dt><dd>Woh port jo copies receive karta hai, jahan analyser laga hai. Yeh <b>monitor port</b> ban jaata hai.</dd>
<dt>Session</dt><dd>Sources aur ek destination ki numbered jodi, jaise <code>monitor session 1</code>.</dd>
</dl>

<h3>Destination port ka kya hota hai</h3>
<ul>
<li>Yeh normal switchport ki tarah kaam karna band kar deta hai: session active rehte MAC addresses nahi seekhta aur spanning tree mein hissa nahi leta.</li>
<li>Default mein yeh attached device se traffic <b>accept nahi karta</b>. Kuch analysers ya IDS sensors ko bhejna padta hai (jaise TCP resets); supported platforms par <code>ingress</code> option yeh allow karta hai.</li>
<li>Copies default mein untagged (native) bheji jaati hain. <code>encapsulation replicate</code> original 802.1Q tags rakhta hai, jo tab kaam aata hai jab source ek trunk ho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Local SPAN lab topology">
<rect x="230" y="30" width="180" height="60" rx="10" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="12">monitor session 1</text>
<rect x="20" y="170" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.11</text>
<rect x="170" y="170" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="230" y="192" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="230" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.12</text>
<rect x="330" y="170" width="120" height="50" rx="8" fill="#fde68a"/><text x="390" y="192" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="390" y="210" text-anchor="middle" class="svg-muted" font-size="12">10.70.0.100</text>
<rect x="490" y="170" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="192" text-anchor="middle" class="svg-ink" font-size="13">SNIFFER</text><text x="555" y="210" text-anchor="middle" class="svg-muted" font-size="12">monitor port</text>
<line x1="260" y1="90" x2="80" y2="170" stroke="#64748b" stroke-width="2"/><text x="140" y="120" class="svg-accent" font-size="12">Gi0/1 rx</text>
<line x1="300" y1="90" x2="230" y2="170" stroke="#64748b" stroke-width="2"/><text x="225" y="140" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="340" y1="90" x2="390" y2="170" stroke="#64748b" stroke-width="2"/><text x="370" y="140" class="svg-accent" font-size="12">Gi0/3 both</text>
<line x1="380" y1="90" x2="555" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="490" y="120" class="svg-accent" font-size="12">Gi0/7 dest</text>
</svg><p class="cap">Local SPAN lab: SRV1 dono directions mein aur PC1 ka received traffic Gi0/7 par SNIFFER tak copy hota hai.</p></div>

<h3>Lab walkthrough: local SPAN</h3>
<p>SW1 Gi0/3 par billing server SRV1 par shak hai ki woh aise hosts se baat karta hai jinse nahi karni chahiye. Security team ne Gi0/7 par capture laptop (SNIFFER) lagaya. PC1 Gi0/1 par, PC2 Gi0/2 par hai, sab VLAN 10 (10.70.0.0/24) mein.</p>
<pre class="code">SW1# configure terminal
SW1(config)# monitor session 1 source interface g0/3            <span class="c">! both default hai</span>
SW1(config)# monitor session 1 destination interface g0/7
SW1(config)# monitor session 1 source interface g0/1 rx         <span class="c">! PC1: sirf received</span>
SW1(config)# end</pre>
<p>Ab traffic generate karo: PC1 10.70.0.100 par SRV1 ko ping kare. SNIFFER echo requests (Gi0/1 par received aur Gi0/3 se bahar bheje gaye) aur echo replies (Gi0/3 par received) dekhta hai. Dhyan do ki jo frame do sources se match karta hai, jaise yahan PC1 ki request, woh phir bhi har session mein sirf ek baar copy hota hai.</p>
<pre class="out">SW1# show monitor session 1
Session 1
---------
Type                     : <span class="hl">Local Session</span>
Source Ports             :
    <span class="hl">RX Only              : Gi0/1</span>
    <span class="hl">Both                 : Gi0/3</span>
<span class="hl">Destination Ports        : Gi0/7</span>
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<p>Session <code>no monitor session 1</code> se hatao; tab Gi0/7 apni normal access port configuration par laut aata hai.</p>

<h3>Yaad rakhne wali restrictions</h3>
<ul>
<li>Ek port ek saath source aur destination nahi ho sakta, aur destination sirf ek session ka hota hai.</li>
<li>Har switch par sessions ki sankhya kam aur platform dependent hoti hai. Nayi team ko mirror promise karne se pehle check karo.</li>
<li>Kai platforms par ek session mein port sources aur VLAN sources mix karna allowed nahi.</li>
<li>Oversubscription: jo copies destination port mein fit nahi hoti woh <b>drop</b> hoti hain. SPAN original traffic ko kabhi slow nahi karta, par copies kho sakta hai.</li>
<li>Filters: jab trunk source ho, <code>monitor session 1 filter vlan 10</code> limit karta hai ki kaunse VLANs copy hon.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> SRV1 1 Gbps par chalta hai aur peak par 700 Mbps receive aur 600 Mbps send karta hai. Use dono directions mein mirror karne se 1.3 Gbps copies banti hain, par SNIFFER port 1 Gbps hai. Lagbhag 300 Mbps copies drop hoti hain aur capture mein gaps aur jhoothe "TCP retransmission" hints dikhte hain. Fix: sirf <code>rx</code> mirror karo, 10 Gbps destination port use karo, ya zaroori VLANs tak filter karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Destination ke roop mein uplink ya kisi user wala port chun lena. Session configure hote hi port normal traffic forward karna band kar deta hai aur user ya uplink chup ho jaata hai. Hamesha ek dedicated, labelled port chuno.</p></div>

<div class="exam"><p><b>Exam trap.</b> Keyword ke bina direction <code>both</code> hai. <code>rx</code> ka matlab hai source port par <i>switch ne receive kiya</i> traffic, jo attached host ne <i>bheja</i> hai. Kai candidates ise ulta samajhte hain.</p></div>

<div class="scn"><h4>IDS jise har conversation ka sirf aadha hissa dikhta tha</h4><p>SPAN port se connect hone ke baad ek IDS ne hazaaron "TCP handshake incomplete" alerts report kiye. Engineer ne <code>show monitor session 1</code> chalaya aur uplink ko "RX Only" dekha: kisi ne doosre switch ka template copy kar diya tha. IDS sirf inbound packets dekh raha tha, replies kabhi nahi. Source ko <code>both</code> karne se (aur oversubscription se bachne ke liye destination ko 10 Gbps par upgrade karne se) alerts gayab ho gaye.</p><p><b>Seekh:</b> security tools ko conversation ki dono directions chahiye; session output mein direction check karo.</p></div>

<div class="iv"><p class="q">"Jab aap kisi port ko SPAN destination banate ho to uska kya hota hai?"</p><p>Woh monitor port ban jaata hai: sirf copies transmit karta hai, normal switching band karta hai, MACs nahi seekhta aur session active rehte spanning tree mein hissa nahi leta. Default mein analyser ka bheja traffic drop karta hai jab tak ingress enable na ho. Batao ki agar sources destination speed se zyada hon to copies drop ho sakti hain, par originals par kabhi asar nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN analysis ke liye source ports ya VLANs se traffic destination port par copy karta hai; originals ko chhoota nahi.</li>
<li>Directions: rx, tx, both (default).</li>
<li>Destination monitor port ban jaata hai: MAC learning nahi, STP nahi, default mein ingress nahi.</li>
<li><code>show monitor session N</code> se verify karo: type, RX Only / TX Only / Both, destination ports.</li>
<li>Oversubscription par nazar rakho: zyada copies destination par drop hoti hain.</li>
</ul></div>
`}};export{e as default};