var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="`+(o||`#64748b`)+`"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="8" fill="#0ea5e9" stroke="#0369a1"/>`,i=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="`+(n?`#22c55e`:`#ffffff`)+`" stroke="#15803d" stroke-width="2"/>`,a=a=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+a.aria+`">`+e(20,90,290,125,`#f1f5f9`,``)+e(330,90,290,125,`#f1f5f9`,``)+e(60,12,170,38,`#ddd6fe`,a.wa)+e(410,12,170,38,`#ddd6fe`,a.wb)+n(230,40,410,40,`#7c3aed`)+t(320,33,a.tun,`svg-accent`)+n(145,50,100,112,`#94a3b8`)+n(145,50,200,112,`#94a3b8`)+n(495,50,440,112,`#94a3b8`)+n(495,50,540,112,`#94a3b8`)+r(100,120)+r(200,120)+r(440,120)+r(540,120)+t(320,152,a.l2r)+n(200,160,440,160,`#f97316`,!0)+i(200,160,!0)+i(440,160,!1)+t(320,184,a.l3r)+n(150,192,480,192,`#7c3aed`,!0)+i(150,192,!0)+i(480,192,!1)+t(165,208,a.b1,`svg-muted`)+t(475,208,a.b2,`svg-muted`)+r(20,238)+t(34,242,a.k1,`svg-ink`,`start`)+e(100,230,22,16,`#ddd6fe`,``)+t(130,242,a.k2,`svg-ink`,`start`)+i(240,238,!0)+t(252,242,a.k3,`svg-ink`,`start`)+n(20,268,50,268,`#f97316`,!0)+t(58,272,a.k4,`svg-ink`,`start`)+n(260,268,290,268,`#7c3aed`,!0)+t(298,272,a.k5,`svg-ink`,`start`)+`</svg><p class="cap">`+a.cap+`</p></div>`,o=a({aria:`Two controllers with L2 and L3 roaming paths`,wa:`WLC-A Main Tower`,wb:`WLC-B Annex`,tun:`Mobility tunnel`,l2r:`Voice: L2 roam, same VLAN`,l3r:`Data: L3 roam, tunnel to anchor`,b1:`Main Tower`,b2:`Annex`,k1:`AP`,k2:`Controller`,k3:`Client (start, filled)`,k4:`L2 roam path`,k5:`L3 roam and mobility tunnel`,cap:`Lakeside General: the voice client keeps its subnet and roams without a tunnel; the data client lands on a different subnet, so its traffic is tunnelled back to the anchor.`}),s=a({aria:`Do controllers ke beech L2 aur L3 roaming paths`,wa:`WLC-A Main Tower`,wb:`WLC-B Annex`,tun:`Mobility tunnel`,l2r:`Voice: L2 roam, same VLAN`,l3r:`Data: L3 roam, anchor tak tunnel`,b1:`Main Tower`,b2:`Annex`,k1:`AP`,k2:`Controller`,k3:`Client (start, filled)`,k4:`L2 roam path`,k5:`L3 roam aur mobility tunnel`,cap:`Lakeside General: voice client apna subnet rakhta hai aur bina tunnel ke roam karta hai; data client doosre subnet par land karta hai, isliye uska traffic anchor tak tunnel hota hai.`}),c={id:`roaming-design`,h:{en:`Roaming design: L2 vs L3, mobility groups, 802.11k/v/r`,hi:`Roaming design: L2 vs L3, mobility groups aur 802.11k/v/r`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the mobility part of an enterprise WLAN: how clients roam between APs and controllers, how mobility groups and tunnels carry that roam, how voice, video, multicast and mDNS behave on the move, how to size a high-density hall for Wi-Fi 6/6E/7, how location and IoT services fit, and how guest, BYOD and industry-specific WLANs are built. Every chapter starts with a named customer, a brief, constraints, options, a trade-off table, the chosen design and a post-mortem, exactly the way the ENWLSD 300-425 exam asks you to think.</p>
<p><b>Prerequisites.</b> The earlier survey module (requirements, RF, placement, channels) and basic controller and AP knowledge. You should know what a VLAN, an SSID and 802.1X are. No deep CLI knowledge is needed; this is a design exam.</p>

<h3>Case 1: Lakeside General Hospital (fictional)</h3>
<p>Lakeside General has a Main Tower and an Annex joined by a skybridge. Each building has its own Catalyst 9800 controller (WLC-A and WLC-B). Nurses carry Wi-Fi phones and walk the skybridge all day. Doctors use tablets on a data SSID. Old infusion pumps use a legacy SSID.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>Voice calls must survive a walk between buildings. A typical target is a roam below about 50 ms for voice, with no IP change.</li>
<li>Data sessions (clinical apps) must not reset when a tablet moves buildings.</li>
<li>Security is 802.1X with a RADIUS server; the pumps only support an older WPA2 profile.</li>
<li>The network team does not want one huge flat VLAN across both buildings.</li>
</ul>

<h3>First, the vocabulary</h3>
<dl class="terms">
<dt>Roaming</dt><dd>A client moving its association from one AP to another. It can be inside one controller or between controllers.</dd>
<dt>Layer 2 roam</dt><dd>The client lands on an AP whose WLAN maps to the same VLAN and subnet. The client keeps its IP address and no tunnel is needed.</dd>
<dt>Layer 3 roam</dt><dd>The new AP maps the WLAN to a different subnet. To keep the client IP address valid, traffic is tunnelled back to the original controller, called the <b>anchor</b>. The controller the client is now on is the <b>foreign</b> controller.</dd>
<dt>Mobility group</dt><dd>A set of controllers that trust each other and share client context so roams are fast. They exchange mobility control messages and form data tunnels.</dd>
<dt>Mobility domain</dt><dd>The larger set of controllers that can hand off clients, which may contain several mobility groups. Typical scale limits depend on platform and release, so confirm them in the current guide.</dd>
</dl>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Roam behaviour</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. Extend one VLAN across both buildings</b></td><td>All roams are L2</td><td>Simple, no tunnel</td><td>Big broadcast domain, failure spreads, DHCP pool sizing</td></tr>
<tr><td><b>B. Different VLAN per building, one mobility group</b></td><td>L3 roam, tunnel to anchor</td><td>Small domains, session kept</td><td>Tunnel load, anchor dependency, symmetric path</td></tr>
<tr><td><b>C. Mixed: voice VLAN identical, data per building</b></td><td>Voice L2, data L3</td><td>Fast voice, contained data</td><td>More design to document</td></tr>
</table>

<h3>Chosen design</h3>
<p>Lakeside picks option C. The voice WLAN uses the same VLAN and subnet (a /24 from 192.0.2.0/24 as a documentation example) on both controllers so voice roams stay Layer 2. The data WLAN has one VLAN per building, so a tablet moving between buildings does an L3 roam over the mobility tunnel. Both controllers sit in the <b>same mobility group</b> with the same group name and each other as peers.</p>

<div class="eg"><p><b>Worked example.</b> A nurse leaves a Main Tower room on voice at 192.0.2.40. She reaches the Annex AP. Both controllers carry the voice VLAN, so she keeps 192.0.2.40 and the roam is a Layer 2 inter-controller roam. A doctor on the data SSID starts at 10.10.1.25 in the Main Tower, then lands on an Annex AP whose data VLAN is 10.20.1.0/24. WLC-A stays the anchor and WLC-B forwards the doctor traffic to WLC-A through the tunnel, so the session lives on.</p></div>
`+o+`
<h3>Making the roam fast: 802.11k, v and r</h3>
<ul>
<li><b>802.11k</b> lets the AP give the client a neighbour list. The phone scans only the listed channels, so it finds the next AP quickly.</li>
<li><b>802.11v</b> includes BSS Transition Management. The network can suggest a better AP to a sticky client. It is a suggestion, and the client may ignore it.</li>
<li><b>802.11r (Fast Transition)</b> pre-derives keys so the client does not repeat the full 802.1X exchange. It works over the air or over the distribution system.</li>
<li><b>OKC</b> (opportunistic key caching) reuses the PMK across APs for WPA2 Enterprise clients that support it. Cisco CCKM is the older Cisco-specific method.</li>
</ul>
<p>Cisco controllers offer an <b>Adaptive 802.11r</b> setting that advertises Fast Transition only to clients that handle it, which protects old devices that crash when they see an FT element in the beacon. Without a full 802.1X redo, a typical roam can fall from hundreds of milliseconds to well under 50 ms.</p>

<h3>Validating the tunnels</h3>
<p>The roam only works if the controllers can talk. Verify that both controllers appear as up peers in each mobility list, that group names and keys match, and that the firewall between them permits the mobility control and data ports (typical: UDP 16666 control and UDP 16667 data for CAPWAP based mobility; older AireOS data used EoIP, IP protocol 97). Confirm exact ports for your release.</p>

<div class="warn"><p><b>Common mistakes.</b> Mismatched mobility group names, an ACL that blocks the mobility ports, different WLAN security settings on the two controllers (a roam fails if the WLAN is not identical), and enabling 802.11r in mandatory mode for a SSID that still has legacy clients.</p></div>
<div class="exam"><p><b>Exam trap.</b> Same mobility group does not mean same RF group. RF grouping (RRM) and mobility are separate. Also, 802.11k and v are assists; they do not replace correct AP overlap of roughly 15 to 20 percent for voice (typical).</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>The pumps that would not join</h4><p>After go-live the nurses were happy, but forty infusion pumps lost Wi-Fi. They sat on a WPA2 SSID where 802.11r had been set to Enabled (mandatory). The pumps did not understand the FT element and refused to associate. The engineer switched that WLAN to Adaptive for the FT setting, then retested one pump with a packet capture. All pumps joined, while phones still used Fast Transition.</p><p><b>Lesson:</b> test the oldest client class before you enable a roaming optimization, and use Adaptive when unsure.</p></div>

<div class="iv"><p class="q">"A client moves between two controllers in different subnets. What happens, and how do you keep the session alive?"</p><p>Strong answer: it is a Layer 3 roam. The controllers must be in a mobility group. The original controller becomes the anchor and the foreign controller tunnels the client traffic to it, so the IP address stays valid. Mention symmetric tunnelling, the mobility ports, and that 802.11r/k/v and OKC reduce the key exchange time but do not move subnets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 roam = same subnet, no tunnel. L3 roam = different subnet, traffic tunnelled to the anchor.</li>
<li>Mobility groups share client context; they are not the same as RF groups.</li>
<li>802.11k gives neighbours, 802.11v suggests a better AP, 802.11r and OKC speed up key exchange.</li>
<li>Use Adaptive 802.11r when legacy clients exist.</li>
<li>Validate peers, group names, and the firewall ports before blaming roaming.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap enterprise WLAN ka mobility part design karna seekhoge: clients APs aur controllers ke beech kaise roam karte hain, mobility groups aur tunnels us roam ko kaise carry karte hain, voice, video, multicast aur mDNS chalte hue kaise behave karte hain, high-density hall ko Wi-Fi 6/6E/7 ke liye kaise size karein, location aur IoT services kahan fit hoti hain, aur guest, BYOD aur industry-specific WLANs kaise bante hain. Har chapter ek named customer, brief, constraints, options, trade-off table, chosen design aur post-mortem se shuru hota hai, bilkul waise jaise ENWLSD 300-425 exam aapse sochne ko kehta hai.</p>
<p><b>Prerequisites.</b> Pichla survey module (requirements, RF, placement, channels) aur basic controller aur AP knowledge. Aapko pata hona chahiye ki VLAN, SSID aur 802.1X kya hote hain. Deep CLI knowledge nahi chahiye; yeh design exam hai.</p>

<h3>Case 1: Lakeside General Hospital (fictional)</h3>
<p>Lakeside General mein Main Tower aur Annex hain jo skybridge se jude hain. Har building ka apna Catalyst 9800 controller hai (WLC-A aur WLC-B). Nurses Wi-Fi phones leke din bhar skybridge par chalti hain. Doctors data SSID par tablets use karte hain. Purane infusion pumps ek legacy SSID use karte hain.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Voice calls buildings ke beech chalne par bhi bachni chahiye. Typical target voice ke liye lagbhag 50 ms se kam roam hai, IP change ke bina.</li>
<li>Tablet building badle to data sessions (clinical apps) reset nahi hone chahiye.</li>
<li>Security RADIUS server ke saath 802.1X hai; pumps sirf purana WPA2 profile support karte hain.</li>
<li>Network team dono buildings mein ek bahut bada flat VLAN nahi chahti.</li>
</ul>

<h3>Pehle vocabulary</h3>
<dl class="terms">
<dt>Roaming</dt><dd>Client ka ek AP se doosre AP par association move karna. Yeh ek controller ke andar ya controllers ke beech ho sakta hai.</dd>
<dt>Layer 2 roam</dt><dd>Client aise AP par land karta hai jiska WLAN same VLAN aur subnet se map hota hai. Client apna IP rakhta hai aur tunnel nahi chahiye.</dd>
<dt>Layer 3 roam</dt><dd>Naya AP WLAN ko doosre subnet se map karta hai. Client ka IP valid rakhne ke liye traffic original controller tak tunnel hota hai, jise <b>anchor</b> kehte hain. Client jis controller par ab hai woh <b>foreign</b> controller hai.</dd>
<dt>Mobility group</dt><dd>Controllers ka set jo ek doosre par trust karte hain aur client context share karte hain taaki roams fast hon. Woh mobility control messages exchange karte hain aur data tunnels banate hain.</dd>
<dt>Mobility domain</dt><dd>Bada set controllers ka jo clients hand off kar sakte hain, aur jisme kai mobility groups ho sakte hain. Typical scale limits platform aur release par depend karti hain, isliye current guide mein confirm karo.</dd>
</dl>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Roam behaviour</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>A. Ek VLAN dono buildings mein extend</b></td><td>Saare roams L2</td><td>Simple, tunnel nahi</td><td>Bada broadcast domain, failure phailta hai, DHCP pool sizing</td></tr>
<tr><td><b>B. Har building ka alag VLAN, ek mobility group</b></td><td>L3 roam, anchor tak tunnel</td><td>Chhote domains, session bacha rehta hai</td><td>Tunnel load, anchor par dependency, symmetric path</td></tr>
<tr><td><b>C. Mixed: voice VLAN same, data per building</b></td><td>Voice L2, data L3</td><td>Fast voice, data contained</td><td>Zyada design document karna padta hai</td></tr>
</table>

<h3>Chosen design</h3>
<p>Lakeside option C chunta hai. Voice WLAN dono controllers par same VLAN aur subnet use karta hai (documentation example ke liye 192.0.2.0/24 se ek /24), isliye voice roams Layer 2 rehte hain. Data WLAN ka har building mein ek VLAN hai, isliye buildings ke beech tablet L3 roam karta hai mobility tunnel ke through. Dono controllers <b>same mobility group</b> mein hain, same group name ke saath aur ek doosre ko peer ke roop mein.</p>

<div class="eg"><p><b>Worked example.</b> Ek nurse Main Tower ke room se voice par 192.0.2.40 ke saath nikalti hai. Woh Annex AP tak pahunchti hai. Dono controllers voice VLAN carry karte hain, isliye woh 192.0.2.40 rakhti hai aur roam Layer 2 inter-controller roam hota hai. Ek doctor data SSID par Main Tower mein 10.10.1.25 se shuru karta hai, phir Annex AP par land karta hai jiska data VLAN 10.20.1.0/24 hai. WLC-A anchor rehta hai aur WLC-B doctor ka traffic tunnel se WLC-A ko forward karta hai, isliye session chalta rehta hai.</p></div>
`+s+`
<h3>Roam ko fast banana: 802.11k, v aur r</h3>
<ul>
<li><b>802.11k</b> AP ko client ko neighbour list dene deta hai. Phone sirf listed channels scan karta hai, isliye agla AP jaldi milta hai.</li>
<li><b>802.11v</b> mein BSS Transition Management hai. Network sticky client ko better AP suggest kar sakta hai. Yeh suggestion hai, client ignore kar sakta hai.</li>
<li><b>802.11r (Fast Transition)</b> keys pehle se derive kar leta hai taaki client poora 802.1X exchange dobara na kare. Yeh over the air ya over the distribution system chalta hai.</li>
<li><b>OKC</b> (opportunistic key caching) WPA2 Enterprise clients ke liye PMK ko APs ke beech reuse karta hai jo ise support karte hain. Cisco CCKM purana Cisco-specific method hai.</li>
</ul>
<p>Cisco controllers mein <b>Adaptive 802.11r</b> setting hoti hai jo Fast Transition sirf un clients ko advertise karti hai jo ise handle karte hain, isse purane devices bachte hain jo beacon mein FT element dekh kar crash ho jate hain. Poore 802.1X redo ke bina typical roam saikdon milliseconds se 50 ms se kaafi neeche aa sakta hai.</p>

<h3>Tunnels validate karna</h3>
<p>Roam tabhi chalta hai jab controllers aapas mein baat kar saken. Verify karo ki dono controllers har mobility list mein up peers dikhte hain, group names aur keys match karte hain, aur beech ka firewall mobility control aur data ports allow karta hai (typical: CAPWAP based mobility ke liye UDP 16666 control aur UDP 16667 data; purane AireOS mein data ke liye EoIP, IP protocol 97). Apni release ke liye exact ports confirm karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Mobility group names ka mismatch, ACL jo mobility ports block karti hai, dono controllers par alag WLAN security settings (WLAN identical na ho to roam fail hota hai), aur legacy clients wale SSID par 802.11r mandatory mode mein enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Same mobility group ka matlab same RF group nahi hota. RF grouping (RRM) aur mobility alag cheezein hain. Aur 802.11k aur v assists hain; woh voice ke liye lagbhag 15 se 20 percent AP overlap (typical) ki jagah nahi lete.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Jo pumps join nahi hue</h4><p>Go-live ke baad nurses khush thi, lekin chalees infusion pumps ka Wi-Fi chala gaya. Woh ek WPA2 SSID par the jahan 802.11r Enabled (mandatory) set tha. Pumps FT element samajhte nahi the aur associate hone se mana kar diya. Engineer ne us WLAN ka FT setting Adaptive kiya, phir ek pump ko packet capture ke saath retest kiya. Saare pumps join ho gaye, jabki phones ab bhi Fast Transition use karte rahe.</p><p><b>Seekh:</b> roaming optimization enable karne se pehle sabse purani client class test karo, aur sure na ho to Adaptive use karo.</p></div>

<div class="iv"><p class="q">"Client alag subnets wale do controllers ke beech move karta hai. Kya hota hai, aur session kaise zinda rakhte ho?"</p><p>Strong answer: yeh Layer 3 roam hai. Controllers ko mobility group mein hona chahiye. Original controller anchor ban jata hai aur foreign controller client traffic ko tunnel se uske paas bhejta hai, isliye IP address valid rehta hai. Symmetric tunnelling, mobility ports ka zikr karo, aur batao ki 802.11r/k/v aur OKC key exchange time ghatate hain lekin subnet nahi badalte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 roam = same subnet, tunnel nahi. L3 roam = alag subnet, traffic anchor tak tunnel.</li>
<li>Mobility groups client context share karte hain; yeh RF groups ke same nahi hain.</li>
<li>802.11k neighbours deta hai, 802.11v better AP suggest karta hai, 802.11r aur OKC key exchange fast karte hain.</li>
<li>Legacy clients hon to Adaptive 802.11r use karo.</li>
<li>Roaming ko blame karne se pehle peers, group names aur firewall ports validate karo.</li>
</ul></div>
`}};export{c as default};