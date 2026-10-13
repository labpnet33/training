var e={id:`mobility-groups`,h:{en:`Mobility groups and domains: build the group (lab wl-mob-group)`,hi:`Mobility groups aur domains: group banao (lab wl-mob-group)`},body:{en:`
<h3>Why controllers need to be introduced to each other</h3>
<p>Imagine two bank branches. A customer from Branch A walks into Branch B. The cashier at B can only help if B knows A exists, trusts it, and has a secure line to ask "is this really your customer, and what is the account?" Two wireless controllers are the same. A controller will not accept a stranger's client record or tunnel traffic to an unknown address. A <b>mobility group</b> is the introduction: a named set of controllers that trust each other and exchange client information.</p>

<h3>The vocabulary</h3>
<dl class="terms">
<dt>Mobility group</dt><dd>A named set of controllers that share client context and, for fast roaming, key material (PMK for OKC, 802.11r keys). Controllers in one group can hand clients to each other. The group name is case sensitive.</dd>
<dt>Mobility domain</dt><dd>The wider set of all controllers that know about each other through member lists, possibly across several groups. A client can still roam between groups in a domain, but fast-roaming keys are shared only inside a group.</dd>
<dt>Mobility peer (member)</dt><dd>Another controller listed in this controller's member table, identified by its wireless management IP address.</dd>
<dt>Public IP</dt><dd>The address a peer should use to reach this controller when NAT sits between them. Without NAT it is the same as the management IP.</dd>
<dt>Mobility MAC address</dt><dd>An identifier the controller uses in mobility messages. An HA pair shares one mobility MAC so that peers see it as one controller (chapter 9).</dd>
</dl>

<h3>What must be true</h3>
<ol>
<li>Each controller has a <b>group name</b>.</li>
<li>Each controller lists the other as a <b>member</b> with its management IP, public IP and group name. <b>Both sides must do it.</b> A peer configured on one side only stays Down.</li>
<li>The group name in each member entry must be the group the peer actually belongs to.</li>
<li>The management addresses must reach each other in both directions (chapter 5).</li>
<li>Controllers run compatible software. Catalyst 9800 uses the "new mobility" based on CAPWAP; mobility with AireOS controllers is possible from their 8.x releases (inter-release controller mobility), but always read the release notes. Group size limits depend on the platform and release, so check the scale tables rather than memorising a number.</li>
</ol>
<p>The default group name on a controller is <code>default</code>. Two controllers that both still carry <code>default</code> would form a group by accident, which is why you always set a deliberate name.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Mobility group membership">
<rect x="10" y="10" width="620" height="190" rx="12" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="6 4"/><text x="320" y="32" text-anchor="middle" class="svg-accent" font-size="14">Mobility group NK-CAMPUS</text>
<rect x="60" y="60" width="200" height="90" rx="8" fill="#bae6fd"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC1 (Mumbai)</text><text x="160" y="106" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="12">member: 10.20.99.10</text>
<rect x="380" y="60" width="200" height="90" rx="8" fill="#bae6fd"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC2 (Delhi)</text><text x="480" y="106" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="12">member: 10.10.99.10</text>
<line x1="260" y1="105" x2="380" y2="105" stroke="#7c3aed" stroke-width="3"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">each lists the other</text>
</svg><p class="cap">Both controllers carry the same group name and list each other. Remove either member line and the peer stays Down.</p></div>

<h3>Configuration (the lab)</h3>
<p>In lab <b>wl-mob-group</b> two controllers are up but strangers. On <b>WLC1</b>:</p>
<pre class="code"><span class="c">! WLC1, Mumbai HQ, management 10.10.99.10</span>
configure terminal
 wireless mobility group name NK-CAMPUS
 wireless mobility group member ip 10.20.99.10 public-ip 10.20.99.10 group NK-CAMPUS
end</pre>
<p>On <b>WLC2</b> the mirror image:</p>
<pre class="code"><span class="c">! WLC2, Delhi, management 10.20.99.10</span>
configure terminal
 wireless mobility group name NK-CAMPUS
 wireless mobility group member ip 10.10.99.10 public-ip 10.10.99.10 group NK-CAMPUS
end</pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Mobility</b>. The Global Configuration tab holds the group name; the Peer Configuration tab adds the peer with its IP, public IP and group. Peer state is under <b>Monitoring &gt; Mobility</b>. Other global options you will meet in the next chapter: <code>wireless mobility dscp</code>, <code>wireless mobility group keepalive interval</code> and <code>count</code>, and <code>wireless mobility mac-address</code>. Add <code>data-link-encryption</code> to the member line to encrypt the data path; both sides must agree.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless mobility summary

Mobility Summary

Wireless Management VLAN: 99
Wireless Management IP Address: 10.10.99.10
Mobility Control Message DSCP Value: 48
Mobility Keepalive Interval/Count: 10/3
<span class="hl">Mobility Group Name: NK-CAMPUS</span>
Mobility Multicast Ipv4 address: 0.0.0.0

Controllers configured in the Mobility Domain:

IP               Public Ip         Group Name    Multicast IPv4  Status    PMTU
10.10.99.10      N/A               NK-CAMPUS     0.0.0.0         N/A       N/A
<span class="hl">10.20.99.10      10.20.99.10       NK-CAMPUS     0.0.0.0         Up        1385</span></pre>
<p>The first row is the controller itself. The <b>Status</b> column of the peer row is what you check: <code>Up</code> means both the control path and the data path work. Run the same command on WLC2 and expect the mirror image. Both sides Up is the pass condition of the lab.</p>

<div class="eg"><p><b>Worked example.</b> A company has controllers in Mumbai, Delhi and Pune. For a full mesh, each controller lists the other two, so each member table has two entries plus itself. Three controllers need 3 pairs and 6 member lines. Add a fourth and it becomes 6 pairs and 12 lines, which is why large domains are scripted or built with templates.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing the group name differently on the two controllers (NK-Campus versus NK-CAMPUS). (2) Adding the member on one controller only. (3) Using the AP management subnet instead of the <i>wireless management</i> IP of the peer. (4) Leaving both controllers on the default group name and believing it is configured.</p></div>

<div class="exam"><p><b>Exam trap.</b> Group versus domain. Membership of one group is what allows shared fast-roaming keys; the domain is just everything a controller can see. The group name is case sensitive, and a member is always identified by its wireless management IP address.</p></div>

<div class="scn"><h4>Three offices, one name wrong</h4><p>A retail chain built a three-controller group. Two stores roamed fine, but the third never showed in the member table as Up. Compared line by line, the third controller had the group name <code>NK-CAMPUS </code> with a trailing space copied from a document. The other two controllers saw a different group name and stayed Down for that peer. Retyping the name fixed it in one minute.</p><p><b>Lesson:</b> use show wireless mobility summary on every member and compare group names character by character.</p></div>

<div class="iv"><p class="q">"What is the difference between a mobility group and a mobility domain, and why does it matter?"</p><p>A group is a named set of controllers that share client context and fast-roaming keys. The domain is the full set of controllers that know each other across groups. It matters because OKC, CCKM and 802.11r key sharing work only within a group; roaming between groups still carries the client, but not the cached keys.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A mobility group is a named set of controllers that trust each other and share client context.</li>
<li>Both controllers must list each other; one-sided configuration stays Down.</li>
<li>The member is identified by the wireless management IP; the group name is case sensitive.</li>
<li>Fast-roaming keys are shared inside a group; a domain can contain several groups.</li>
<li>Check with show wireless mobility summary and read the Status column.</li>
</ul></div>
`,hi:`
<h3>Controllers ko ek doosre se introduce kyun karana padta hai</h3>
<p>Do bank branches socho. Branch A ka customer Branch B mein aata hai. B ka cashier tabhi madad kar sakta hai jab B ko pata ho ki A exist karta hai, use trust karta hai, aur uske paas secure line ho poochne ke liye "kya yeh sach mein aapka customer hai, aur account kya hai?". Do wireless controllers bhi aise hi hain. Controller kisi ajnabi ka client record accept nahi karega aur na hi anjaan address par traffic tunnel karega. <b>Mobility group</b> yahi introduction hai: controllers ka ek named set jo ek doosre par trust karte hain aur client information exchange karte hain.</p>

<h3>Vocabulary</h3>
<dl class="terms">
<dt>Mobility group</dt><dd>Controllers ka named set jo client context aur fast roaming ke liye key material (OKC ke liye PMK, 802.11r keys) share karta hai. Ek group ke controllers ek doosre ko clients hand over kar sakte hain. Group name case sensitive hai.</dd>
<dt>Mobility domain</dt><dd>Un sab controllers ka bada set jo member lists ke zariye ek doosre ko jaante hain, shayad kai groups mein. Client domain ke groups ke beech bhi roam kar sakta hai, lekin fast-roaming keys sirf group ke andar share hoti hain.</dd>
<dt>Mobility peer (member)</dt><dd>Is controller ki member table mein listed doosra controller, jo uske wireless management IP address se pehchana jata hai.</dd>
<dt>Public IP</dt><dd>Woh address jo peer ko is controller tak pahunchne ke liye use karna chahiye jab beech mein NAT ho. NAT na ho to yeh management IP ke barabar hota hai.</dd>
<dt>Mobility MAC address</dt><dd>Ek identifier jo controller mobility messages mein use karta hai. HA pair ek mobility MAC share karta hai taaki peers use ek controller ki tarah dekhein (chapter 9).</dd>
</dl>

<h3>Kya sach hona chahiye</h3>
<ol>
<li>Har controller ka ek <b>group name</b> ho.</li>
<li>Har controller doosre ko <b>member</b> ki tarah list kare, uske management IP, public IP aur group name ke saath. <b>Dono sides ko karna hai.</b> Sirf ek side par configured peer Down rehta hai.</li>
<li>Har member entry ka group name woh group ho jisme peer asal mein belong karta hai.</li>
<li>Management addresses dono directions mein ek doosre tak pahunchne chahiye (chapter 5).</li>
<li>Controllers compatible software chalayein. Catalyst 9800 CAPWAP par based "new mobility" use karta hai; AireOS controllers ke saath mobility unke 8.x releases se possible hai (inter-release controller mobility), lekin hamesha release notes padho. Group size limits platform aur release par depend karti hain, isliye number yaad karne ki jagah scale tables check karo.</li>
</ol>
<p>Controller par default group name <code>default</code> hota hai. Do controllers jo dono abhi bhi <code>default</code> rakhte hain galti se group bana lenge, isliye hamesha jaan boojh kar naam set karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Mobility group membership">
<rect x="10" y="10" width="620" height="190" rx="12" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="6 4"/><text x="320" y="32" text-anchor="middle" class="svg-accent" font-size="14">Mobility group NK-CAMPUS</text>
<rect x="60" y="60" width="200" height="90" rx="8" fill="#bae6fd"/><text x="160" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC1 (Mumbai)</text><text x="160" y="106" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="12">member: 10.20.99.10</text>
<rect x="380" y="60" width="200" height="90" rx="8" fill="#bae6fd"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC2 (Delhi)</text><text x="480" y="106" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="12">member: 10.10.99.10</text>
<line x1="260" y1="105" x2="380" y2="105" stroke="#7c3aed" stroke-width="3"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">dono ek doosre ko list karte hain</text>
</svg><p class="cap">Dono controllers ka group name same hai aur dono ek doosre ko list karte hain. Koi bhi member line hata do to peer Down rehta hai.</p></div>

<h3>Configuration (lab)</h3>
<p>Lab <b>wl-mob-group</b> mein do controllers up hain lekin ajnabi. <b>WLC1</b> par:</p>
<pre class="code"><span class="c">! WLC1, Mumbai HQ, management 10.10.99.10</span>
configure terminal
 wireless mobility group name NK-CAMPUS
 wireless mobility group member ip 10.20.99.10 public-ip 10.20.99.10 group NK-CAMPUS
end</pre>
<p><b>WLC2</b> par mirror image:</p>
<pre class="code"><span class="c">! WLC2, Delhi, management 10.20.99.10</span>
configure terminal
 wireless mobility group name NK-CAMPUS
 wireless mobility group member ip 10.10.99.10 public-ip 10.10.99.10 group NK-CAMPUS
end</pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Mobility</b>. Global Configuration tab mein group name hota hai; Peer Configuration tab peer ko IP, public IP aur group ke saath add karta hai. Peer state <b>Monitoring &gt; Mobility</b> mein hai. Doosre global options jo agle chapter mein milenge: <code>wireless mobility dscp</code>, <code>wireless mobility group keepalive interval</code> aur <code>count</code>, aur <code>wireless mobility mac-address</code>. Data path encrypt karne ke liye member line mein <code>data-link-encryption</code> jodo; dono sides ko agree hona chahiye.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless mobility summary

Mobility Summary

Wireless Management VLAN: 99
Wireless Management IP Address: 10.10.99.10
Mobility Control Message DSCP Value: 48
Mobility Keepalive Interval/Count: 10/3
<span class="hl">Mobility Group Name: NK-CAMPUS</span>
Mobility Multicast Ipv4 address: 0.0.0.0

Controllers configured in the Mobility Domain:

IP               Public Ip         Group Name    Multicast IPv4  Status    PMTU
10.10.99.10      N/A               NK-CAMPUS     0.0.0.0         N/A       N/A
<span class="hl">10.20.99.10      10.20.99.10       NK-CAMPUS     0.0.0.0         Up        1385</span></pre>
<p>Pehli row controller khud hai. Peer row ka <b>Status</b> column check karna hai: <code>Up</code> ka matlab control path aur data path dono chalte hain. Wahi command WLC2 par chalao aur mirror image expect karo. Dono sides Up hona lab ki pass condition hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke controllers Mumbai, Delhi aur Pune mein hain. Full mesh ke liye har controller baaki do ko list karta hai, to har member table mein do entries aur khud. Teen controllers ko 3 pairs aur 6 member lines chahiye. Chautha jodo to 6 pairs aur 12 lines ho jaati hain, isliye bade domains scripts ya templates se banaye jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Do controllers par group name alag likhna (NK-Campus versus NK-CAMPUS). (2) Member sirf ek controller par add karna. (3) Peer ke <i>wireless management</i> IP ki jagah AP management subnet use karna. (4) Dono controllers ko default group name par chhod dena aur sochna ki configured hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Group versus domain. Ek group ki membership hi shared fast-roaming keys allow karti hai; domain bas woh sab hai jo controller dekh sakta hai. Group name case sensitive hai, aur member hamesha wireless management IP address se pehchana jata hai.</p></div>

<div class="scn"><h4>Teen offices, ek naam galat</h4><p>Ek retail chain ne teen-controller group banaya. Do stores mein roaming theek thi, lekin teesra member table mein kabhi Up nahi dikha. Line by line compare karne par pata chala ki teesre controller ka group name <code>NK-CAMPUS </code> tha, ek document se copy hua trailing space ke saath. Baaki do controllers ko alag group name dikha aur us peer ke liye Down rahe. Naam dobara type karne se ek minute mein fix ho gaya.</p><p><b>Lesson:</b> har member par show wireless mobility summary chalao aur group names ko character by character compare karo.</p></div>

<div class="iv"><p class="q">"Mobility group aur mobility domain mein kya farak hai, aur yeh kyun matter karta hai?"</p><p>Group controllers ka named set hai jo client context aur fast-roaming keys share karta hai. Domain un sab controllers ka poora set hai jo groups ke across ek doosre ko jaante hain. Yeh isliye matter karta hai ki OKC, CCKM aur 802.11r key sharing sirf group ke andar kaam karte hain; groups ke beech roaming client ko carry karti hai, lekin cached keys nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mobility group controllers ka named set hai jo ek doosre par trust karte hain aur client context share karte hain.</li>
<li>Dono controllers ek doosre ko list karein; one-sided configuration Down rehti hai.</li>
<li>Member wireless management IP se pehchana jata hai; group name case sensitive hai.</li>
<li>Fast-roaming keys group ke andar share hoti hain; domain mein kai groups ho sakte hain.</li>
<li>show wireless mobility summary se check karo aur Status column padho.</li>
</ul></div>
`}};export{e as default};