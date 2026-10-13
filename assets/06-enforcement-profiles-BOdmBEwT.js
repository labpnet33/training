var e={id:`enforcement-profiles`,h:{en:`Enforcement profiles: what actually goes back to the switch`,hi:`Enforcement profiles: switch ko asal mein kya wapas jaata hai`},body:{en:`
<p>When the guard decides "this visitor gets card type B", somebody still has to program the card. The rulebook only names the card type. The <b>enforcement profile</b> is the programmed card: a list of RADIUS attributes that ClearPass puts into the Access-Accept and that the switch then obeys. The policy chooses, the profile delivers. Without a correct profile a perfectly chosen decision is worthless.</p>

<h3>Profile types</h3>
<p>In the GUI, profiles live under <b>Configuration &gt; Enforcement &gt; Profiles</b> and are based on a template that fixes the kind of attributes. The lab shell models the action of a profile with four types:</p>
<table class="cmp"><tr><th>Type</th><th>What ClearPass sends</th><th>Use</th></tr>
<tr><td>radius</td><td>Access-Accept plus the attributes you add</td><td>Normal access with a role or VLAN</td></tr>
<tr><td>accept</td><td>Access-Accept with no extra attributes</td><td>Built-in [Allow Access Profile]</td></tr>
<tr><td>reject</td><td>Access-Reject</td><td>Built-in [Deny Access Profile]</td></tr>
<tr><td>drop</td><td>Nothing at all</td><td>Built-in [Drop Access Profile]. The client sees silence, not a reject</td></tr></table>
<p>The real product has more templates, for example for TACACS+ privilege levels, agent actions and session notification. These are <b>not simulated in the lab</b>. <b>Downloadable user roles (DUR)</b> also exist in the real product: ClearPass sends the whole role definition, with VLAN and ACLs, to the switch inside the response, so the role need not be preconfigured. That is a concept only here. In this track the role is defined on the switch, and ClearPass sends its name.</p>

<h3>Aruba-User-Role: the attribute that names a switch role</h3>
<p>For Aruba switches, the central attribute is <b>Radius:Aruba:Aruba-User-Role</b>. Its value is the name of a role that must already exist on the switch (<code>port-access role EMPLOYEE</code> with <code>vlan access 10</code>). Three rules follow from this:</p>
<ol>
<li>The name is compared <b>exactly</b>, upper and lower case included. "Employee" is not "EMPLOYEE".</li>
<li>If the switch has no role of that exact name, the role is not applied and the client does not get the intended VLAN.</li>
<li>The role also carries other settings from the switch (VLAN and policy). Changing the VLAN number for all employees means editing the switch role, not the ClearPass profile.</li>
</ol>

<h3>The standard VLAN attributes</h3>
<p>Some sites return VLANs directly instead of roles. That needs three attributes together: <b>Tunnel-Type = VLAN (13)</b>, <b>Tunnel-Medium-Type = 802 (6)</b> and <b>Tunnel-Private-Group-Id = the VLAN id</b>. Without all three the switch ignores the VLAN. In the lab model the Access Tracker raises an alert (code 9011) saying that the group id was returned without the other two, and the client stays in its port VLAN. The lab shell has a shortcut, <code>template vlan 10</code>, that adds all three at once, and <code>template aruba-role EMPLOYEE</code> for the role attribute.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="What the switch does with the RADIUS response">
<rect x="14" y="14" width="190" height="52" rx="8" fill="#fde68a"/><text x="109" y="38" text-anchor="middle" class="svg-ink" font-size="13">Access-Accept from</text><text x="109" y="55" text-anchor="middle" class="svg-ink" font-size="13">ClearPass profile</text>
<rect x="260" y="14" width="360" height="40" rx="8" fill="#bbf7d0"/><text x="440" y="39" text-anchor="middle" class="svg-ink" font-size="13">1 Aruba-User-Role names an existing switch role</text>
<rect x="260" y="64" width="360" height="40" rx="8" fill="#bae6fd"/><text x="440" y="89" text-anchor="middle" class="svg-ink" font-size="13">2 else: all three Tunnel attributes give a VLAN</text>
<rect x="260" y="114" width="360" height="40" rx="8" fill="#e2e8f0"/><text x="440" y="139" text-anchor="middle" class="svg-ink" font-size="13">3 else: the port keeps its own VLAN</text>
<line x1="204" y1="40" x2="260" y2="34" stroke="#64748b" stroke-width="2"/><line x1="204" y1="50" x2="260" y2="84" stroke="#64748b" stroke-width="2"/><line x1="204" y1="60" x2="260" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="320" y="186" text-anchor="middle" class="svg-accent" font-size="13">A role whose VLAN does not exist on the switch cannot be applied either</text>
</svg><p class="cap">The switch decides in this order. A wrong name or an incomplete attribute set falls through silently to the next step.</p></div>

<h3>Lab shell: creating a profile</h3>
<pre class="code"><span class="c">! Configuration &gt; Enforcement &gt; Profiles (Lab shell on CPPM)</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR
<span class="c">! the same profile could use VLANs instead of a role:</span>
<span class="c">! configuration enforcement profile EP-CONTRACTOR template vlan 20</span></pre>
<p>On the switch the matching object already exists (AOS-CX style syntax, representative):</p>
<pre class="code"><span class="c">! Switch ACCESS</span>
port-access role CONTRACTOR
    vlan access 20</pre>
<p>Now read what really went to the switch. The Output tab of an Access Tracker record shows the response:</p>
<pre class="out">Output
------
  Enforcement Profiles      : EP-CONTRACTOR

RADIUS Response
  Radius:Aruba:Aruba-User-Role            = <span class="hl">CONTRACTOR</span></pre>
<p>Lab output, representative of the layout. For a VLAN profile you would see three lines: Tunnel-Type, Tunnel-Medium-Type and Tunnel-Private-Group-Id.</p>

<h3>The profile and the switch must agree</h3>
<p>The profile is one half of a contract. The other half is on the switch. A good habit is to check both sides in the same minute: the Output tab for what ClearPass sent, and <code>show port-access clients detail</code> for what the switch applied. If they disagree, the problem is in the translation: a typo, a missing role, a missing VLAN or an incomplete attribute set. Later in this module you will see that a role whose VLAN was deleted, or a VLAN missing from the uplink trunk, shows the same symptom.</p>

<div class="warn"><p><b>Common mistakes.</b> A profile whose Aruba-User-Role differs in case from the switch role. Returning only Tunnel-Private-Group-Id. Editing a profile and expecting connected clients to move without a new authentication. Building a drop profile and then wondering why there is no reject in the logs.</p></div>
<div class="exam"><p><b>Exam trap.</b> [Deny Access Profile] rejects (the client is told no); [Drop Access Profile] sends nothing (the client is not told). Also: VLAN assignment by standard attributes needs all three of Tunnel-Type 13, Tunnel-Medium-Type 6 and Tunnel-Private-Group-Id.</p></div>

<div class="scn"><h4>The VLAN that was ignored</h4><p>A site assigned VLANs by RADIUS attributes. After a profile clean-up, new users were accepted but sat in VLAN 1 without an address. The profile returned only Tunnel-Private-Group-Id, because somebody removed two lines that looked redundant. The Access Tracker showed an enforcement alert about the missing attributes. Re-adding the VLAN template to both profiles and re-authenticating the ports fixed it.</p><p><b>Lesson:</b> Accepted does not mean correct. Read the response attributes, not just the result.</p></div>

<div class="iv"><p class="q">"What does the switch need from ClearPass to place a user in VLAN 20?"</p><p>Strong answer: either Aruba-User-Role naming a switch role that has VLAN 20, or the three standard attributes Tunnel-Type VLAN, Tunnel-Medium-Type 802 and Tunnel-Private-Group-Id 20. Mention exact case-sensitive role names and that the VLAN must exist on the switch and be allowed on the uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The profile is the set of RADIUS attributes that the switch obeys.</li>
<li>Aruba-User-Role must match the switch role name exactly, case included.</li>
<li>Standard VLAN assignment needs Tunnel-Type 13, Tunnel-Medium-Type 6 and the VLAN id together.</li>
<li>Types: radius, accept, reject, drop. Drop sends nothing.</li>
<li>Downloadable user roles exist in the real product but are not simulated.</li>
</ul></div>
`,hi:`
<p>Guard jab tay kar leta hai "is visitor ko card type B milega", tab bhi kisi ko card program karna padta hai. Rulebook sirf card type ka naam leti hai. <b>Enforcement profile</b> programmed card hai: RADIUS attributes ki list jo ClearPass Access-Accept mein daalta hai aur jise switch phir maanta hai. Policy chunti hai, profile deliver karta hai. Sahi profile ke bina perfect decision bhi bekar hai.</p>

<h3>Profile types</h3>
<p>GUI mein profiles <b>Configuration &gt; Enforcement &gt; Profiles</b> mein rehte hain aur ek template par based hote hain jo attributes ka kind fix karta hai. Lab shell profile ke action ko chaar types se model karta hai:</p>
<table class="cmp"><tr><th>Type</th><th>ClearPass kya bhejta hai</th><th>Use</th></tr>
<tr><td>radius</td><td>Access-Accept aur aapke jode hue attributes</td><td>Role ya VLAN ke saath normal access</td></tr>
<tr><td>accept</td><td>Bina extra attributes ke Access-Accept</td><td>Built-in [Allow Access Profile]</td></tr>
<tr><td>reject</td><td>Access-Reject</td><td>Built-in [Deny Access Profile]</td></tr>
<tr><td>drop</td><td>Kuch bhi nahi</td><td>Built-in [Drop Access Profile]. Client ko reject nahi, khaamoshi milti hai</td></tr></table>
<p>Asli product mein aur templates hain, jaise TACACS+ privilege levels, agent actions aur session notification ke liye. Woh lab mein <b>simulate nahi</b> hote. Asli product mein <b>downloadable user roles (DUR)</b> bhi hote hain: ClearPass poori role definition, VLAN aur ACLs ke saath, response ke andar switch ko bhejta hai, to role pehle se configure karna zaroori nahi. Yahan yeh sirf concept hai. Is track mein role switch par define hota hai, aur ClearPass uska naam bhejta hai.</p>

<h3>Aruba-User-Role: woh attribute jo switch role ka naam deta hai</h3>
<p>Aruba switches ke liye central attribute <b>Radius:Aruba:Aruba-User-Role</b> hai. Uski value aise role ka naam hai jo switch par pehle se hona chahiye (<code>port-access role EMPLOYEE</code> aur <code>vlan access 10</code>). Isse teen rules nikalte hain:</p>
<ol>
<li>Naam <b>exactly</b> compare hota hai, upper aur lower case samet. "Employee" aur "EMPLOYEE" alag hain.</li>
<li>Agar switch par exact us naam ka role nahi hai, to role apply nahi hota aur client ko intended VLAN nahi milta.</li>
<li>Role switch ki doosri settings (VLAN aur policy) bhi le jaata hai. Saare employees ka VLAN number badalna ho to switch role edit karte hain, ClearPass profile nahi.</li>
</ol>

<h3>Standard VLAN attributes</h3>
<p>Kuch sites roles ke bajaye seedha VLANs return karti hain. Uske liye teen attributes ek saath chahiye: <b>Tunnel-Type = VLAN (13)</b>, <b>Tunnel-Medium-Type = 802 (6)</b> aur <b>Tunnel-Private-Group-Id = VLAN id</b>. Teeno ke bina switch VLAN ignore karta hai. Lab model mein Access Tracker alert deta hai (code 9011) ki group id baaki do ke bina return hua, aur client apne port VLAN mein rehta hai. Lab shell mein shortcut hai, <code>template vlan 10</code>, jo teeno ek saath jodta hai, aur role attribute ke liye <code>template aruba-role EMPLOYEE</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Switch RADIUS response ke saath kya karta hai">
<rect x="14" y="14" width="190" height="52" rx="8" fill="#fde68a"/><text x="109" y="38" text-anchor="middle" class="svg-ink" font-size="13">ClearPass profile se</text><text x="109" y="55" text-anchor="middle" class="svg-ink" font-size="13">Access-Accept</text>
<rect x="260" y="14" width="360" height="40" rx="8" fill="#bbf7d0"/><text x="440" y="39" text-anchor="middle" class="svg-ink" font-size="13">1 Aruba-User-Role mojooda switch role ka naam de</text>
<rect x="260" y="64" width="360" height="40" rx="8" fill="#bae6fd"/><text x="440" y="89" text-anchor="middle" class="svg-ink" font-size="13">2 warna: teeno Tunnel attributes VLAN dein</text>
<rect x="260" y="114" width="360" height="40" rx="8" fill="#e2e8f0"/><text x="440" y="139" text-anchor="middle" class="svg-ink" font-size="13">3 warna: port apna VLAN rakhta hai</text>
<line x1="204" y1="40" x2="260" y2="34" stroke="#64748b" stroke-width="2"/><line x1="204" y1="50" x2="260" y2="84" stroke="#64748b" stroke-width="2"/><line x1="204" y1="60" x2="260" y2="134" stroke="#64748b" stroke-width="2"/>
<text x="320" y="186" text-anchor="middle" class="svg-accent" font-size="13">Jis role ka VLAN switch par nahi hai, woh bhi apply nahi ho sakta</text>
</svg><p class="cap">Switch isi order mein decide karta hai. Galat naam ya incomplete attribute set chupke se agle step par gir jaata hai.</p></div>

<h3>Lab shell: profile banana</h3>
<pre class="code"><span class="c">! Configuration &gt; Enforcement &gt; Profiles (Lab shell on CPPM)</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR
<span class="c">! wahi profile role ke bajaye VLAN bhi use kar sakta tha:</span>
<span class="c">! configuration enforcement profile EP-CONTRACTOR template vlan 20</span></pre>
<p>Switch par matching object pehle se maujood hai (AOS-CX style syntax, representative):</p>
<pre class="code"><span class="c">! Switch ACCESS</span>
port-access role CONTRACTOR
    vlan access 20</pre>
<p>Ab padho ki switch ko asal mein kya gaya. Access Tracker record ka Output tab response dikhata hai:</p>
<pre class="out">Output
------
  Enforcement Profiles      : EP-CONTRACTOR

RADIUS Response
  Radius:Aruba:Aruba-User-Role            = <span class="hl">CONTRACTOR</span></pre>
<p>Lab output, layout representative hai. VLAN profile mein teen lines dikhengi: Tunnel-Type, Tunnel-Medium-Type aur Tunnel-Private-Group-Id.</p>

<h3>Profile aur switch ko agree karna chahiye</h3>
<p>Profile contract ka ek hissa hai. Doosra hissa switch par hai. Achhi aadat hai ek hi minute mein dono side check karna: ClearPass ne kya bheja iske liye Output tab, aur switch ne kya apply kiya iske liye <code>show port-access clients detail</code>. Agar dono mein farak hai to problem translation mein hai: typo, missing role, missing VLAN ya incomplete attribute set. Is module mein aage dekhoge ki jis role ka VLAN delete ho gaya ho, ya jo VLAN uplink trunk par allowed nahi, uska symptom bhi yahi dikhta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Aisa profile jiska Aruba-User-Role switch role se case mein alag hai. Sirf Tunnel-Private-Group-Id return karna. Profile edit karke expect karna ki connected clients bina nayi authentication ke move ho jaayenge. Drop profile bana kar sochna ki logs mein reject kyun nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> [Deny Access Profile] reject karta hai (client ko "no" bataya jaata hai); [Drop Access Profile] kuch nahi bhejta (client ko bataya nahi jaata). Saath hi: standard attributes se VLAN assignment ko Tunnel-Type 13, Tunnel-Medium-Type 6 aur Tunnel-Private-Group-Id teeno chahiye.</p></div>

<div class="scn"><h4>Woh VLAN jo ignore ho gaya</h4><p>Ek site RADIUS attributes se VLANs assign karti thi. Profile clean-up ke baad naye users accept hue lekin VLAN 1 mein bina address ke baithe rahe. Profile sirf Tunnel-Private-Group-Id return kar raha tha, kyunki kisi ne do lines hata di thi jo redundant lagti thi. Access Tracker ne missing attributes ka enforcement alert dikhaya. Dono profiles mein VLAN template wapas jodne aur ports ko re-authenticate karne se fix ho gaya.</p><p><b>Seekh:</b> Accepted ka matlab correct nahi. Sirf result nahi, response attributes padho.</p></div>

<div class="iv"><p class="q">"User ko VLAN 20 mein daalne ke liye switch ko ClearPass se kya chahiye?"</p><p>Strong answer: ya to Aruba-User-Role jo VLAN 20 wale switch role ka naam de, ya teen standard attributes Tunnel-Type VLAN, Tunnel-Medium-Type 802 aur Tunnel-Private-Group-Id 20. Batao ki role naam exact case-sensitive hote hain aur VLAN switch par exist karna aur uplink par allowed hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profile un RADIUS attributes ka set hai jinhe switch maanta hai.</li>
<li>Aruba-User-Role switch role ke naam se exactly match karna chahiye, case samet.</li>
<li>Standard VLAN assignment ko Tunnel-Type 13, Tunnel-Medium-Type 6 aur VLAN id ek saath chahiye.</li>
<li>Types: radius, accept, reject, drop. Drop kuch nahi bhejta.</li>
<li>Downloadable user roles asli product mein hain lekin simulate nahi hote.</li>
</ul></div>
`}};export{e as default};