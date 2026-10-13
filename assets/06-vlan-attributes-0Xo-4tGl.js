var e={id:`vlan-attributes`,h:{en:`Dynamic VLAN with standard Tunnel attributes`,hi:`Standard Tunnel attributes se dynamic VLAN`},body:{en:`
<p>Suppose a hotel assigns guests to floors. Sending a note that says only "floor 20" is not enough for the lift operator, who wants to be told three things: "this is a floor instruction", "using the building numbering", and "the number is 20". With only the last item, he ignores the note. RADIUS VLAN assignment is the same: three attributes together make one instruction.</p>

<h3>Two ways to place a user</h3>
<table class="cmp"><tr><th></th><th>Aruba-User-Role</th><th>Tunnel VLAN attributes</th></tr>
<tr><td>Standard</td><td>Aruba vendor-specific</td><td>IETF RADIUS standard (RFC 2868 style), works with many vendors</td></tr>
<tr><td>Carries</td><td>A role name, switch defines the meaning</td><td>A VLAN ID or name only</td></tr>
<tr><td>Needs on switch</td><td>Matching port-access role</td><td>The VLAN must exist</td></tr>
<tr><td>Best for</td><td>Rich policy, same vendor everywhere</td><td>Mixed-vendor access layers</td></tr></table>
<p>Both are valid. A site often uses roles on Aruba switches and Tunnel attributes for other brands. You must be able to recognise which one a profile is meant to use.</p>

<h3>The three attributes</h3>
<dl class="terms">
<dt>Tunnel-Type</dt><dd>Set to <code>VLAN</code>, numeric value 13.</dd>
<dt>Tunnel-Medium-Type</dt><dd>Set to <code>802</code>, numeric value 6, meaning the IEEE 802 media (Ethernet).</dd>
<dt>Tunnel-Private-Group-Id</dt><dd>The VLAN itself, written as a string such as <code>10</code>.</dd>
</dl>
<p>The names look odd because the RFC was written for tunnels, and VLANs reused the same attribute set. In the ClearPass GUI these appear as <code>Radius:IETF:Tunnel-Type</code>, <code>Radius:IETF:Tunnel-Medium-Type</code> and <code>Radius:IETF:Tunnel-Private-Group-Id</code>. Without all three the switch ignores the VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three Tunnel attributes">
<rect x="20" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Type</text><text x="115" y="68" text-anchor="middle" class="svg-accent" font-size="13">VLAN (13)</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Medium-Type</text><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="13">802 (6)</text>
<rect x="430" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Private-Group-Id</text><text x="525" y="68" text-anchor="middle" class="svg-accent" font-size="13">"10"</text>
<line x1="115" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="525" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="140" width="240" height="46" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">Port moves to VLAN 10</text>
<text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">Missing any one: VLAN ignored</text>
</svg><p class="cap">The VLAN is applied only when all three attributes arrive.</p></div>

<h3>The lab: cp-vlan-attrs</h3>
<p>This site assigns VLANs with standard attributes. Alice and Bob are accepted, yet both stay in VLAN 1 with no address. The profiles return only Tunnel-Private-Group-Id. Follow the same discipline as before: prove the symptom first.</p>
<pre class="out">ACCESS# show port-access clients

Port    MAC-Address        Status       Role      VLAN   Method
------- ------------------ ------------ --------- ------ -------
1/1/3   00:50:2f:e9:9a:01  authorized   -         <span class="hl">1</span>      dot1x
1/1/4   00:50:2f:e9:9a:02  authorized   -         <span class="hl">1</span>      dot1x

CPPM Access Tracker  detail latest alerts
  <span class="hl">9011: VLAN attribute incomplete, Tunnel-Type and Tunnel-Medium-Type missing</span></pre>
<p>Authorized in VLAN 1 is the telltale picture: the switch accepted the login but had no valid placement, so it left the port in its own VLAN. (The alert number 9011 is how the lab model labels this problem; a real ClearPass may not flag this by itself, so on real equipment you find it by reading the Output tab and the switch.)</p>

<h3>The fix (Lab shell)</h3>
<pre class="code"><span class="c">! one template adds all three attributes with the VLAN id</span>
configuration enforcement profile EP-EMPLOYEE template vlan 10
configuration enforcement profile EP-CONTRACTOR template vlan 20
<span class="c">! bounce the ports so they authenticate again</span>
<span class="c">! on ACCESS</span>
interface 1/1/3-1/1/4
    shutdown
    exit
interface 1/1/3-1/1/4
    no shutdown
    exit</pre>
<p>In the real GUI you add the three attributes one by one on the profile's Attributes tab, or start from a built-in VLAN-assignment profile template and set the VLAN value. The template is a shortcut, not a different mechanism.</p>
<pre class="out">CPPM Access Tracker  detail latest output
  Radius:IETF:Tunnel-Type             = VLAN (13)
  Radius:IETF:Tunnel-Medium-Type      = 802 (6)
  Radius:IETF:Tunnel-Private-Group-Id = <span class="hl">10</span>

ACCESS# show port-access clients
1/1/3   00:50:2f:e9:9a:01  authorized   -   <span class="hl">10</span>   dot1x
1/1/4   00:50:2f:e9:9a:02  authorized   -   <span class="hl">20</span>   dot1x</pre>
<p>Then prove addresses: LAPTOP1 gets one from 10.20.10.0/24 and LAPTOP2 from 10.20.20.0/24, and both ping APP1 (10.20.70.20) as policy on R1 allows.</p>

<div class="eg"><p><b>Worked example.</b> Count the attributes in three profiles. Profile A returns Tunnel-Type=13 and Tunnel-Private-Group-Id=10 only: VLAN ignored. Profile B returns all three with Group-Id "10": VLAN 10. Profile C returns all three with Group-Id "110" but the switch has no VLAN 110: the client cannot be placed. Only B works. The VLAN must also be allowed on the uplink trunk, or the client authorizes yet DHCP fails.</p></div>

<h3>Why not both at once?</h3>
<p>You can return a role and a VLAN together. Remember the switch precedence: a role that exists wins. If the role exists, the Tunnel VLAN is not what places the client. Combining them is useful only when you understand which one wins; otherwise it becomes confusing during troubleshooting.</p>

<div class="note"><p><b>Real platform note.</b> Changing a profile does not move an already connected client. The new attributes apply at the next authentication. That is why the lab bounces the ports. In production a change of authorization (chapter 8 previews it, module 4 teaches it) can force reauthentication.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing the VLAN as "VLAN10" or "vlan 10" in Tunnel-Private-Group-Id. Use the plain number (or, when the switch supports it, the exact VLAN name). Another is forgetting that Tunnel-Type and Tunnel-Medium-Type are fixed values, not user choices.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three values are 13 (VLAN), 6 (802) and the VLAN ID. "Tunnel-Private-Group-Id" is the attribute that carries the VLAN, despite the name.</p></div>

<div class="scn"><h4>Vendor swap, VLAN 1 everywhere</h4><p>A site migrated one building from another vendor's switches to AOS-CX. Users were authenticated but all landed in the default VLAN. The old switches tolerated a profile with only the Group-Id; the new ones required the complete set. Using the VLAN profile template restored placement building-wide.</p><p><b>Lesson:</b> a switch can be strict where an older one was forgiving; send the complete standard set.</p></div>

<div class="iv"><p class="q">"How does ClearPass assign a VLAN dynamically, and what can go wrong?"</p><p>Strong answer: an enforcement profile returns Tunnel-Type VLAN, Tunnel-Medium-Type 802 and Tunnel-Private-Group-Id with the VLAN; the switch moves the authorized port into it. Failure modes: missing attributes so the VLAN is ignored, a VLAN that does not exist or is not on the trunk, or a stale session that has not reauthenticated.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standard VLAN assignment needs Tunnel-Type 13, Tunnel-Medium-Type 6 and Tunnel-Private-Group-Id.</li>
<li>Without all three the switch ignores the VLAN: authorized in VLAN 1, no address.</li>
<li>Use the VLAN template to add all three at once.</li>
<li>Changes apply at the next authentication; bounce or CoA.</li>
<li>The VLAN must exist and be allowed on the uplink.</li>
</ul></div>
`,hi:`
<p>Maan lo ek hotel guests ko floors assign karta hai. Sirf "floor 20" ka note lift operator ke liye kaafi nahi, use teen baatein chahiye: "yeh floor instruction hai", "building numbering ke hisaab se", aur "number 20 hai". Sirf aakhri item ke saath woh note ignore kar deta hai. RADIUS VLAN assignment bhi aisa hi hai: teen attributes mil kar ek instruction banate hain.</p>

<h3>User ko place karne ke do tareeke</h3>
<table class="cmp"><tr><th></th><th>Aruba-User-Role</th><th>Tunnel VLAN attributes</th></tr>
<tr><td>Standard</td><td>Aruba vendor-specific</td><td>IETF RADIUS standard (RFC 2868 style), kai vendors ke saath chalta hai</td></tr>
<tr><td>Kya le jaata hai</td><td>Role name, matlab switch define karta hai</td><td>Sirf VLAN ID ya name</td></tr>
<tr><td>Switch par kya chahiye</td><td>Matching port-access role</td><td>VLAN exist karna chahiye</td></tr>
<tr><td>Kiske liye best</td><td>Rich policy, har jagah same vendor</td><td>Mixed-vendor access layers</td></tr></table>
<p>Dono valid hain. Ek site aksar Aruba switches par roles aur doosre brands ke liye Tunnel attributes use karti hai. Aapko pehchanna aana chahiye ki profile kaunsa use karne ke liye bana hai.</p>

<h3>Teen attributes</h3>
<dl class="terms">
<dt>Tunnel-Type</dt><dd><code>VLAN</code> par set, numeric value 13.</dd>
<dt>Tunnel-Medium-Type</dt><dd><code>802</code> par set, numeric value 6, matlab IEEE 802 media (Ethernet).</dd>
<dt>Tunnel-Private-Group-Id</dt><dd>VLAN khud, string ke roop mein jaise <code>10</code>.</dd>
</dl>
<p>Naam ajeeb lagte hain kyunki RFC tunnels ke liye likha gaya tha, aur VLANs ne wahi attribute set reuse kiya. ClearPass GUI mein yeh <code>Radius:IETF:Tunnel-Type</code>, <code>Radius:IETF:Tunnel-Medium-Type</code> aur <code>Radius:IETF:Tunnel-Private-Group-Id</code> ke roop mein dikhte hain. Teeno ke bina switch VLAN ignore karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three Tunnel attributes">
<rect x="20" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Type</text><text x="115" y="68" text-anchor="middle" class="svg-accent" font-size="13">VLAN (13)</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Medium-Type</text><text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="13">802 (6)</text>
<rect x="430" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Tunnel-Private-Group-Id</text><text x="525" y="68" text-anchor="middle" class="svg-accent" font-size="13">"10"</text>
<line x1="115" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="525" y1="90" x2="320" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="140" width="240" height="46" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">Port VLAN 10 mein jaata hai</text>
<text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">Koi ek missing: VLAN ignore</text>
</svg><p class="cap">VLAN tabhi apply hota hai jab teeno attributes aayein.</p></div>

<h3>Lab: cp-vlan-attrs</h3>
<p>Yeh site VLANs standard attributes se assign karti hai. Alice aur Bob accept hue, phir bhi dono VLAN 1 mein hain bina address ke. Profiles sirf Tunnel-Private-Group-Id return karte hain. Pehle jaisi discipline follow karo: pehle symptom prove karo.</p>
<pre class="out">ACCESS# show port-access clients

Port    MAC-Address        Status       Role      VLAN   Method
------- ------------------ ------------ --------- ------ -------
1/1/3   00:50:2f:e9:9a:01  authorized   -         <span class="hl">1</span>      dot1x
1/1/4   00:50:2f:e9:9a:02  authorized   -         <span class="hl">1</span>      dot1x

CPPM Access Tracker  detail latest alerts
  <span class="hl">9011: VLAN attribute incomplete, Tunnel-Type and Tunnel-Medium-Type missing</span></pre>
<p>VLAN 1 mein authorized yehi pehchaan hai: switch ne login accept kiya par valid placement nahi mila, isliye port apne VLAN mein chhod diya. (Alert number 9011 lab model ka label hai; real ClearPass shayad ise khud flag na kare, isliye real equipment par aap Output tab aur switch padh kar ise dhoondhte ho.)</p>

<h3>Fix (Lab shell)</h3>
<pre class="code"><span class="c">! one template adds all three attributes with the VLAN id</span>
configuration enforcement profile EP-EMPLOYEE template vlan 10
configuration enforcement profile EP-CONTRACTOR template vlan 20
<span class="c">! bounce the ports so they authenticate again</span>
<span class="c">! on ACCESS</span>
interface 1/1/3-1/1/4
    shutdown
    exit
interface 1/1/3-1/1/4
    no shutdown
    exit</pre>
<p>Real GUI mein aap profile ke Attributes tab par teen attributes ek ek karke add karte ho, ya built-in VLAN-assignment profile template se shuru karke VLAN value set karte ho. Template shortcut hai, alag mechanism nahi.</p>
<pre class="out">CPPM Access Tracker  detail latest output
  Radius:IETF:Tunnel-Type             = VLAN (13)
  Radius:IETF:Tunnel-Medium-Type      = 802 (6)
  Radius:IETF:Tunnel-Private-Group-Id = <span class="hl">10</span>

ACCESS# show port-access clients
1/1/3   00:50:2f:e9:9a:01  authorized   -   <span class="hl">10</span>   dot1x
1/1/4   00:50:2f:e9:9a:02  authorized   -   <span class="hl">20</span>   dot1x</pre>
<p>Phir addresses prove karo: LAPTOP1 ko 10.20.10.0/24 se aur LAPTOP2 ko 10.20.20.0/24 se address milta hai, aur dono APP1 (10.20.70.20) ko ping karte hain jaisa R1 ki policy allow karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen profiles ke attributes gino. Profile A sirf Tunnel-Type=13 aur Tunnel-Private-Group-Id=10 return karta hai: VLAN ignore. Profile B teeno return karta hai, Group-Id "10" ke saath: VLAN 10. Profile C teeno return karta hai, Group-Id "110" ke saath par switch par VLAN 110 nahi hai: client place nahi ho sakta. Sirf B kaam karta hai. VLAN uplink trunk par bhi allowed hona chahiye, warna client authorize hota hai par DHCP fail hota hai.</p></div>

<h3>Dono ek saath kyun nahi?</h3>
<p>Aap role aur VLAN saath mein return kar sakte ho. Switch ki precedence yaad rakho: jo role exist karta hai woh jeetta hai. Role exist kare to Tunnel VLAN client ko place nahi karta. Dono ko milana tabhi kaam ka hai jab aap samajhte ho kaunsa jeetta hai; warna troubleshooting mein confusion hoti hai.</p>

<div class="note"><p><b>Real platform note.</b> Profile badalne se pehle se connected client nahi hilta. Naye attributes agle authentication par lagte hain. Isiliye lab ports bounce karta hai. Production mein change of authorization (chapter 8 ek preview deta hai, module 4 padhata hai) reauthentication force kar sakta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Tunnel-Private-Group-Id mein VLAN ko "VLAN10" ya "vlan 10" likhna. Plain number use karo (ya switch support kare to exact VLAN name). Doosri galti: yeh bhoolna ki Tunnel-Type aur Tunnel-Medium-Type fixed values hain, user ki choice nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen values hain 13 (VLAN), 6 (802) aur VLAN ID. "Tunnel-Private-Group-Id" naam ke bawajood woh attribute hai jo VLAN carry karta hai.</p></div>

<div class="scn"><h4>Vendor swap, har jagah VLAN 1</h4><p>Ek site ne ek building ko doosre vendor ke switches se AOS-CX par migrate kiya. Users authenticate hue par sab default VLAN mein pahunche. Purane switches sirf Group-Id wale profile ko tolerate karte the; naye ko poora set chahiye tha. VLAN profile template use karne se poori building mein placement wapas aa gayi.</p><p><b>Seekh:</b> switch strict ho sakta hai jahan purana forgiving tha; poora standard set bhejo.</p></div>

<div class="iv"><p class="q">"ClearPass VLAN dynamically kaise assign karta hai, aur kya galat ho sakta hai?"</p><p>Strong answer: enforcement profile Tunnel-Type VLAN, Tunnel-Medium-Type 802 aur VLAN ke saath Tunnel-Private-Group-Id return karta hai; switch authorized port ko usme daalta hai. Failure modes: attributes missing jisse VLAN ignore hota hai, VLAN jo exist nahi karta ya trunk par nahi hai, ya purana session jo reauthenticate nahi hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Standard VLAN assignment ko Tunnel-Type 13, Tunnel-Medium-Type 6 aur Tunnel-Private-Group-Id chahiye.</li>
<li>Teeno ke bina switch VLAN ignore karta hai: VLAN 1 mein authorized, address nahi.</li>
<li>VLAN template teeno ek saath add karta hai.</li>
<li>Changes agle authentication par lagte hain; bounce ya CoA.</li>
<li>VLAN exist kare aur uplink par allowed ho.</li>
</ul></div>
`}};export{e as default};