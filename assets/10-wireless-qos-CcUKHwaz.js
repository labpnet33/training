var e={id:`wireless-qos`,h:{en:`Wireless QoS: WMM, access categories and WLC profiles`,hi:`Wireless QoS: WMM, access categories aur WLC profiles`},body:{en:`
<p>A Wi-Fi cell is a meeting room where only one person may speak at a time, and anyone who wants to speak must first wait for silence plus a short random pause. If everyone uses the same pause, the manager with an urgent announcement waits as long as the intern with a joke. Wireless QoS gives the urgent speakers a <b>shorter pause</b>, so they usually get the floor first. There is no priority lane on the air, only better odds.</p>
<p>This chapter covers the ENCOR wireless QoS items. RF, AP modes and roaming live in the enterprise wireless module.</p>

<h3>Why Wi-Fi QoS is different</h3>
<p>A wired link is full duplex and your router's scheduler decides exactly who is sent next. Wi-Fi is <b>half duplex and shared</b>: the AP and every client contend for the same channel using <b>CSMA/CA</b>. The AP cannot schedule client uploads. So Wi-Fi QoS works by changing the <b>contention rules</b> per traffic type, which gives <b>statistical</b> priority rather than a guarantee.</p>

<h3>802.11e, WMM and EDCA</h3>
<p><b>802.11e</b> defines QoS for Wi-Fi; the Wi-Fi Alliance certifies a subset as <b>WMM</b> (Wi-Fi Multimedia). WMM is mandatory for 802.11n and later high-throughput rates. It uses <b>EDCA</b> (Enhanced Distributed Channel Access) with four <b>access categories (ACs)</b>, each with its own queue and its own contention parameters:</p>
<ul>
<li><b>AIFSN</b>: the fixed wait after the channel goes idle; smaller for voice.</li>
<li><b>CWmin / CWmax</b>: the range of the random backoff; smaller for voice.</li>
<li><b>TXOP</b>: how long a station may transmit once it wins the channel.</li>
</ul>
<p>Every 802.11 QoS frame carries a 3-bit <b>User Priority (UP)</b>, 0 to 7, in its QoS Control field, and the UP selects the AC:</p>
<table class="cmp"><tr><th>Access category</th><th>User priority</th><th>Traffic</th><th>Contention</th></tr>
<tr><td>AC_VO voice</td><td>7, 6</td><td>voice</td><td>shortest wait</td></tr>
<tr><td>AC_VI video</td><td>5, 4</td><td>video</td><td>short wait</td></tr>
<tr><td>AC_BE best effort</td><td>0, 3</td><td>normal data</td><td>normal wait</td></tr>
<tr><td>AC_BK background</td><td>2, 1</td><td>bulk, scavenger</td><td>longest wait</td></tr></table>

<h3>Mapping between wired and wireless</h3>
<p>Traffic crosses between DSCP on the wire and UP on the air. With a Cisco controller, AP traffic is tunnelled to the WLC in <b>CAPWAP</b>, and the outer CAPWAP IP header carries a DSCP too, so the wired network can prioritise the tunnel. The mapping recommended by RFC 8325, and used by Cisco:</p>
<table class="cmp"><tr><th>DSCP</th><th>Traffic</th><th>802.11 UP</th><th>AC</th></tr>
<tr><td>EF (46)</td><td>voice</td><td>6</td><td>AC_VO</td></tr>
<tr><td>AF41 (34)</td><td>interactive video</td><td>4</td><td>AC_VI</td></tr>
<tr><td>AF21 (18)</td><td>transactional data</td><td>3</td><td>AC_BE</td></tr>
<tr><td>DF (0)</td><td>best effort</td><td>0</td><td>AC_BE</td></tr>
<tr><td>CS1 (8)</td><td>scavenger</td><td>1</td><td>AC_BK</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Wired to wireless QoS path">
<rect x="10" y="80" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">call server</text><text x="65" y="117" text-anchor="middle" class="svg-muted" font-size="12">DSCP EF</text>
<rect x="170" y="80" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="100" text-anchor="middle" class="svg-ink" font-size="13">WLC</text><text x="225" y="117" text-anchor="middle" class="svg-muted" font-size="12">profile: Platinum</text>
<rect x="340" y="80" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="13">AP</text><text x="395" y="117" text-anchor="middle" class="svg-muted" font-size="12">UP 6, AC_VO</text>
<rect x="510" y="80" width="120" height="46" rx="8" fill="#fde68a"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi phone</text><text x="570" y="117" text-anchor="middle" class="svg-muted" font-size="12">WMM client</text>
<line x1="120" y1="103" x2="170" y2="103" stroke="#64748b" stroke-width="2"/><line x1="280" y1="103" x2="340" y2="103" stroke="#64748b" stroke-width="3"/><line x1="450" y1="103" x2="510" y2="103" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="310" y="70" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP, outer DSCP EF</text>
<text x="480" y="150" text-anchor="middle" class="svg-accent" font-size="12">over the air: 802.11 UP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">the WLAN's QoS profile caps the marking at every step</text>
</svg><p class="cap">Downstream voice: DSCP EF on the wire, EF in the CAPWAP outer header, UP 6 and the voice access category on the air.</p></div>

<h3>Controller QoS profiles: the metal levels</h3>
<p>Cisco controllers assign each WLAN one of four QoS profiles. The profile is a <b>ceiling</b>: traffic may be marked lower than the profile, but anything marked higher is <b>capped down</b> to the profile's maximum.</p>
<table class="cmp"><tr><th>Profile</th><th>Intended for</th><th>Maximum treatment</th></tr>
<tr><td>Platinum</td><td>voice</td><td>voice, EF / UP 6</td></tr>
<tr><td>Gold</td><td>video</td><td>video, AF41 / UP 4 to 5</td></tr>
<tr><td>Silver</td><td>best effort (default)</td><td>best effort, DSCP 0 / UP 0 to 3</td></tr>
<tr><td>Bronze</td><td>background, guest</td><td>background, UP 1 to 2</td></tr></table>
<p>On AireOS the command is <code>config wlan qos 1 platinum</code>. On a Catalyst 9800 controller, the metal policies are applied in the <b>policy profile</b> that the WLAN uses:</p>
<pre class="code">wireless profile policy VOICE-PP
 service-policy input platinum-up
 service-policy output platinum
 no shutdown</pre>
<pre class="out">WLC# show wireless profile policy detailed VOICE-PP
Policy Profile Name                 : VOICE-PP
...
QOS per SSID
<span class="hl">  Ingress Service Name              : platinum-up</span>
<span class="hl">  Egress Service Name               : platinum</span></pre>
<p>The WLAN's <b>WMM policy</b> (allowed, required or disabled) must also permit WMM, otherwise clients cannot send UP-tagged frames and lose high-throughput rates.</p>

<div class="eg"><p><b>Worked example.</b> A Wi-Fi phone marks its voice EF and UP 6 on the VOICE WLAN. With Platinum, the AP keeps UP 6, puts the upstream packet in a CAPWAP tunnel with outer DSCP EF, and the wired network's LLQ recognises it. Move the same WLAN to Silver: the controller caps both the outer DSCP and the downstream UP to best effort, so voice contends in AC_BE with laptops and, on the wired side, lands in class-default instead of the priority queue.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a voice WLAN on the default Silver profile, or putting a guest WLAN on Platinum. The first caps voice to best effort; the second lets any guest device mark itself as voice and win contention against real phones.</p></div>

<div class="exam"><p><b>Exam trap.</b> Platinum = voice, Gold = video, Silver = best effort (default), Bronze = background. The profile is a maximum, not a forced marking. Voice is UP 6 and AC_VO; UP 4 and 5 are video; UP 1 and 2 are background, lower than UP 0.</p></div>

<div class="scn"><h4>Choppy Wi-Fi calls after a controller migration</h4><p>After moving from an AireOS controller to a Catalyst 9800, Wi-Fi handsets started breaking up during busy hours, while desk phones were fine. The WLAN and SSID were identical, but the new policy profile had no metal policy, so traffic was treated as Silver. Captures on the wired side showed CAPWAP packets from the handsets with DSCP 0, landing in class-default on the WAN. Applying <code>platinum</code> and <code>platinum-up</code> to the voice policy profile restored EF in the tunnel and UP 6 on the air.</p><p><b>Lesson:</b> on a migration, check the QoS profile of every WLAN and verify the DSCP of CAPWAP traffic on the wire.</p></div>

<div class="iv"><p class="q">"How does QoS work on Wi-Fi, and what are the WLC QoS profiles?"</p><p>Strong answer: Wi-Fi is shared and half duplex, so 802.11e/WMM uses EDCA with four access categories, voice, video, best effort and background, each with its own AIFSN, contention window and TXOP; voice waits less and wins the channel more often, which is statistical priority. The 3-bit UP in the 802.11 header selects the AC, and DSCP maps to UP, EF to UP 6. On the controller each WLAN has a profile, Platinum, Gold, Silver or Bronze, which caps the maximum marking; voice WLANs use Platinum.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi QoS is statistical: EDCA changes contention (AIFSN, CW, TXOP) per access category.</li>
<li>Four ACs: voice (UP 6, 7), video (UP 4, 5), best effort (UP 0, 3), background (UP 1, 2).</li>
<li>DSCP maps to UP (EF to 6, AF41 to 4); CAPWAP's outer DSCP carries priority across the wire.</li>
<li>WLC profiles Platinum, Gold, Silver (default), Bronze set a ceiling on marking.</li>
<li>On the 9800, metal policies are applied in the policy profile with <code>service-policy input/output</code>.</li>
</ul></div>
`,hi:`
<p>Wi-Fi cell ek meeting room hai jahan ek samay mein sirf ek insaan bol sakta hai, aur jo bolna chahe use pehle khamoshi aur ek chhote random pause ka intezaar karna padta hai. Agar sab same pause use karein, to urgent announcement wala manager utna hi intezaar karta hai jitna joke sunane wala intern. Wireless QoS urgent bolne walon ko <b>chhota pause</b> deta hai, isliye aam taur par unhe pehle mauka milta hai. Hawa mein koi priority lane nahi hai, sirf behtar chances.</p>
<p>Yeh chapter ENCOR ke wireless QoS items cover karta hai. RF, AP modes aur roaming enterprise wireless module mein hain.</p>

<h3>Wi-Fi QoS alag kyun hai</h3>
<p>Wired link full duplex hota hai aur aapke router ka scheduler bilkul decide karta hai ki agla kaun jaayega. Wi-Fi <b>half duplex aur shared</b> hai: AP aur har client <b>CSMA/CA</b> se same channel ke liye contend karte hain. AP client uploads schedule nahi kar sakta. Isliye Wi-Fi QoS har traffic type ke <b>contention rules</b> badal kar kaam karta hai, jo guarantee nahi, <b>statistical</b> priority deta hai.</p>

<h3>802.11e, WMM aur EDCA</h3>
<p><b>802.11e</b> Wi-Fi ke liye QoS define karta hai; Wi-Fi Alliance iske ek hisse ko <b>WMM</b> (Wi-Fi Multimedia) ke roop mein certify karta hai. 802.11n aur baad ke high-throughput rates ke liye WMM zaroori hai. Yeh <b>EDCA</b> (Enhanced Distributed Channel Access) use karta hai chaar <b>access categories (ACs)</b> ke saath, har ek ki apni queue aur apne contention parameters:</p>
<ul>
<li><b>AIFSN</b>: channel idle hone ke baad ka fixed intezaar; voice ke liye chhota.</li>
<li><b>CWmin / CWmax</b>: random backoff ki range; voice ke liye chhoti.</li>
<li><b>TXOP</b>: channel jeetne ke baad station kitni der transmit kar sakta hai.</li>
</ul>
<p>Har 802.11 QoS frame apne QoS Control field mein 3-bit <b>User Priority (UP)</b>, 0 se 7, le jaata hai, aur UP AC chunta hai:</p>
<table class="cmp"><tr><th>Access category</th><th>User priority</th><th>Traffic</th><th>Contention</th></tr>
<tr><td>AC_VO voice</td><td>7, 6</td><td>voice</td><td>sabse kam intezaar</td></tr>
<tr><td>AC_VI video</td><td>5, 4</td><td>video</td><td>kam intezaar</td></tr>
<tr><td>AC_BE best effort</td><td>0, 3</td><td>normal data</td><td>normal intezaar</td></tr>
<tr><td>AC_BK background</td><td>2, 1</td><td>bulk, scavenger</td><td>sabse lamba intezaar</td></tr></table>

<h3>Wired aur wireless ke beech mapping</h3>
<p>Traffic wire par DSCP aur hawa mein UP ke beech aata-jaata hai. Cisco controller ke saath AP traffic <b>CAPWAP</b> mein WLC tak tunnel hota hai, aur bahari CAPWAP IP header bhi DSCP le jaata hai, taaki wired network tunnel ko priority de sake. RFC 8325 ki recommended mapping, jo Cisco use karta hai:</p>
<table class="cmp"><tr><th>DSCP</th><th>Traffic</th><th>802.11 UP</th><th>AC</th></tr>
<tr><td>EF (46)</td><td>voice</td><td>6</td><td>AC_VO</td></tr>
<tr><td>AF41 (34)</td><td>interactive video</td><td>4</td><td>AC_VI</td></tr>
<tr><td>AF21 (18)</td><td>transactional data</td><td>3</td><td>AC_BE</td></tr>
<tr><td>DF (0)</td><td>best effort</td><td>0</td><td>AC_BE</td></tr>
<tr><td>CS1 (8)</td><td>scavenger</td><td>1</td><td>AC_BK</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Wired to wireless QoS path">
<rect x="10" y="80" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">call server</text><text x="65" y="117" text-anchor="middle" class="svg-muted" font-size="12">DSCP EF</text>
<rect x="170" y="80" width="110" height="46" rx="8" fill="#bae6fd"/><text x="225" y="100" text-anchor="middle" class="svg-ink" font-size="13">WLC</text><text x="225" y="117" text-anchor="middle" class="svg-muted" font-size="12">profile: Platinum</text>
<rect x="340" y="80" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="395" y="100" text-anchor="middle" class="svg-ink" font-size="13">AP</text><text x="395" y="117" text-anchor="middle" class="svg-muted" font-size="12">UP 6, AC_VO</text>
<rect x="510" y="80" width="120" height="46" rx="8" fill="#fde68a"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi phone</text><text x="570" y="117" text-anchor="middle" class="svg-muted" font-size="12">WMM client</text>
<line x1="120" y1="103" x2="170" y2="103" stroke="#64748b" stroke-width="2"/><line x1="280" y1="103" x2="340" y2="103" stroke="#64748b" stroke-width="3"/><line x1="450" y1="103" x2="510" y2="103" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="310" y="70" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP, outer DSCP EF</text>
<text x="480" y="150" text-anchor="middle" class="svg-accent" font-size="12">hawa mein: 802.11 UP</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">WLAN ka QoS profile har step par marking ki hadd tay karta hai</text>
</svg><p class="cap">Downstream voice: wire par DSCP EF, CAPWAP outer header mein EF, hawa mein UP 6 aur voice access category.</p></div>

<h3>Controller QoS profiles: metal levels</h3>
<p>Cisco controllers har WLAN ko chaar mein se ek QoS profile dete hain. Profile ek <b>ceiling</b> hai: traffic profile se neeche mark ho sakta hai, par jo kuch upar mark ho woh profile ke maximum tak <b>neeche kar diya</b> jaata hai.</p>
<table class="cmp"><tr><th>Profile</th><th>Kiske liye</th><th>Maximum treatment</th></tr>
<tr><td>Platinum</td><td>voice</td><td>voice, EF / UP 6</td></tr>
<tr><td>Gold</td><td>video</td><td>video, AF41 / UP 4 se 5</td></tr>
<tr><td>Silver</td><td>best effort (default)</td><td>best effort, DSCP 0 / UP 0 se 3</td></tr>
<tr><td>Bronze</td><td>background, guest</td><td>background, UP 1 se 2</td></tr></table>
<p>AireOS par command hai <code>config wlan qos 1 platinum</code>. Catalyst 9800 controller par metal policies us <b>policy profile</b> mein lagti hain jo WLAN use karta hai:</p>
<pre class="code">wireless profile policy VOICE-PP
 service-policy input platinum-up
 service-policy output platinum
 no shutdown</pre>
<pre class="out">WLC# show wireless profile policy detailed VOICE-PP
Policy Profile Name                 : VOICE-PP
...
QOS per SSID
<span class="hl">  Ingress Service Name              : platinum-up</span>
<span class="hl">  Egress Service Name               : platinum</span></pre>
<p>WLAN ki <b>WMM policy</b> (allowed, required ya disabled) ko bhi WMM allow karna chahiye, warna clients UP-tagged frames nahi bhej sakte aur high-throughput rates kho dete hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek Wi-Fi phone VOICE WLAN par apni voice ko EF aur UP 6 mark karta hai. Platinum ke saath AP UP 6 rakhta hai, upstream packet ko outer DSCP EF wale CAPWAP tunnel mein daalta hai, aur wired network ki LLQ use pehchan leti hai. Same WLAN ko Silver par le jao: controller outer DSCP aur downstream UP dono ko best effort tak cap kar deta hai, isliye voice laptops ke saath AC_BE mein contend karti hai aur wired side par priority queue ki jagah class-default mein pahunchti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Voice WLAN ko default Silver profile par chhod dena, ya guest WLAN ko Platinum par daal dena. Pehla voice ko best effort tak cap karta hai; doosra kisi bhi guest device ko khud ko voice mark karke asli phones se contention jeetne deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Platinum = voice, Gold = video, Silver = best effort (default), Bronze = background. Profile ek maximum hai, zabardasti ki marking nahi. Voice UP 6 aur AC_VO hai; UP 4 aur 5 video hain; UP 1 aur 2 background hain, UP 0 se bhi neeche.</p></div>

<div class="scn"><h4>Controller migration ke baad choppy Wi-Fi calls</h4><p>AireOS controller se Catalyst 9800 par jaane ke baad Wi-Fi handsets busy hours mein tootne lage, jabki desk phones theek the. WLAN aur SSID same the, par naye policy profile mein koi metal policy nahi thi, isliye traffic Silver ki tarah treat ho raha tha. Wired side ke captures mein handsets ke CAPWAP packets DSCP 0 ke saath the, jo WAN par class-default mein pahunch rahe the. Voice policy profile par <code>platinum</code> aur <code>platinum-up</code> lagane se tunnel mein EF aur hawa mein UP 6 wapas aaya.</p><p><b>Seekh:</b> migration par har WLAN ka QoS profile check karo aur wire par CAPWAP traffic ka DSCP verify karo.</p></div>

<div class="iv"><p class="q">"Wi-Fi par QoS kaise kaam karta hai, aur WLC QoS profiles kya hain?"</p><p>Strong answer: Wi-Fi shared aur half duplex hai, isliye 802.11e/WMM EDCA use karta hai chaar access categories ke saath, voice, video, best effort aur background, har ek ka apna AIFSN, contention window aur TXOP; voice kam intezaar karti hai aur channel zyada baar jeetti hai, jo statistical priority hai. 802.11 header ka 3-bit UP AC chunta hai, aur DSCP UP par map hota hai, EF se UP 6. Controller par har WLAN ka ek profile hota hai, Platinum, Gold, Silver ya Bronze, jo maximum marking cap karta hai; voice WLANs Platinum use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi QoS statistical hai: EDCA har access category ka contention (AIFSN, CW, TXOP) badalta hai.</li>
<li>Chaar ACs: voice (UP 6, 7), video (UP 4, 5), best effort (UP 0, 3), background (UP 1, 2).</li>
<li>DSCP UP par map hota hai (EF se 6, AF41 se 4); CAPWAP ka outer DSCP wire par priority le jaata hai.</li>
<li>WLC profiles Platinum, Gold, Silver (default), Bronze marking ki ceiling tay karte hain.</li>
<li>9800 par metal policies policy profile mein <code>service-policy input/output</code> se lagti hain.</li>
</ul></div>
`}};export{e as default};