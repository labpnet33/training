var e={id:`lab-two-kinds-of-staff`,h:{en:`Lab walkthrough: two kinds of staff, one policy chain`,hi:`Lab walkthrough: do tarah ka staff, ek policy chain`},body:{en:`
<p>A recipe makes sense only after you have cooked it once. In this chapter you build the full chain for a second group of people, step by step, the way you would on a real site. The lab is <b>cp-role-mapping</b>: "Two kinds of staff: role mapping and enforcement". Read the chapter once, then do the lab with the same commands.</p>

<h3>The situation</h3>
<p>Alice (Department Engineering) already works. Bob (Department Contractor) is rejected, although his password is right. The topology is the usual one: LAPTOP1 on port 1/1/3, LAPTOP2 on 1/1/4 of the switch ACCESS, ClearPass CPPM at 10.20.60.10, application server APP1 at 10.20.70.20. The switch already has the role CONTRACTOR with VLAN 20. The goal: LAPTOP2 in VLAN 20 as CONTRACTOR and LAPTOP1 still in VLAN 10 as EMPLOYEE.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Objects to create for the contractor chain">
<rect x="14" y="14" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="89" y="40" text-anchor="middle" class="svg-ink" font-size="13">alice: Engineering</text>
<rect x="14" y="72" width="150" height="44" rx="8" fill="#fed7aa"/><text x="89" y="98" text-anchor="middle" class="svg-ink" font-size="13">bob: Contractor</text>
<rect x="210" y="14" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="285" y="40" text-anchor="middle" class="svg-ink" font-size="13">role ENGINEER</text>
<rect x="210" y="72" width="150" height="44" rx="8" fill="#fde68a"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="13">NEW role</text><text x="285" y="108" text-anchor="middle" class="svg-ink" font-size="13">CONTRACTOR</text>
<rect x="406" y="14" width="140" height="44" rx="8" fill="#bae6fd"/><text x="476" y="40" text-anchor="middle" class="svg-ink" font-size="13">EP-EMPLOYEE</text>
<rect x="406" y="72" width="140" height="44" rx="8" fill="#fde68a"/><text x="476" y="92" text-anchor="middle" class="svg-ink" font-size="13">NEW profile</text><text x="476" y="108" text-anchor="middle" class="svg-ink" font-size="13">EP-CONTRACTOR</text>
<rect x="560" y="14" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="40" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10</text>
<rect x="560" y="72" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="98" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20</text>
<g stroke="#64748b" stroke-width="2"><line x1="164" y1="36" x2="210" y2="36"/><line x1="164" y1="94" x2="210" y2="94"/><line x1="360" y1="36" x2="406" y2="36"/><line x1="360" y1="94" x2="406" y2="94"/><line x1="546" y1="36" x2="560" y2="36"/><line x1="546" y1="94" x2="560" y2="94"/></g>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="13">Yellow boxes are the three things you add. The switch role CONTRACTOR already exists.</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">attribute, role mapping rule, policy rule, profile, switch role</text>
</svg><p class="cap">Add one role, one role mapping rule, one profile and one policy rule. Nothing else changes.</p></div>

<h3>Step 0: read the failure first</h3>
<p>Before changing anything, get the facts. GUI path: Monitoring &gt; Live Monitoring &gt; Access Tracker, open the latest request for bob. Lab shell: <code>monitoring access-tracker detail bob alerts</code> and <code>monitoring access-tracker detail bob summary</code>.</p>
<pre class="out">Alerts
------
  Error Code                : <span class="hl">9010</span>
  Error Category            : Enforcement
  Error Message             : No enforcement rule matched (default profile [Deny Access Profile])</pre>
<p>Lab output, representative of the layout. Authentication succeeded (no 215, 216 or 217). The Summary shows only [User Authenticated] under Roles. So the first missing piece is in role mapping, and the second in enforcement.</p>

<h3>Step 1: the ClearPass role and the role mapping rule</h3>
<p>GUI path: Configuration &gt; Identity &gt; Roles &gt; Add, name CONTRACTOR. Then Configuration &gt; Identity &gt; Role Mappings &gt; RM-WIRED &gt; Rules &gt; Add: condition on the Department attribute of the local user repository EQUALS Contractor, role CONTRACTOR. Lab shell:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR</pre>

<h3>Step 2: the profile</h3>
<p>GUI path: Configuration &gt; Enforcement &gt; Profiles &gt; Add, a RADIUS-type profile named EP-CONTRACTOR, attribute Radius:Aruba:Aruba-User-Role with value CONTRACTOR. Type the value exactly as the switch role is spelled.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR</pre>

<h3>Step 3: the enforcement policy rule</h3>
<p>GUI path: Configuration &gt; Enforcement &gt; Policies &gt; EPOL-WIRED &gt; Rules &gt; Add, condition Tips:Role EQUALS CONTRACTOR, profile EP-CONTRACTOR.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  2. if Tips:Role EQUALS <span class="hl">CONTRACTOR</span> then <span class="hl">EP-CONTRACTOR</span></pre>
<p>Lab output, representative of the layout. The new rule is added at the end. That is safe here, because the two conditions are mutually exclusive, but you will see in the next chapter that position matters whenever rules can overlap.</p>

<h3>Step 4: make Bob authenticate again and prove it</h3>
<p>Enforcement runs only when a client authenticates. Bob's port is in a failed state and the switch retries after its quiet period (20 seconds in the model). You can also bounce the port. Then renew the address on the laptop (<code>ip dhcp</code>) and ping the server. On the switch, verify:</p>
<pre class="code"><span class="c">! Lab shell, LAPTOP2 then ACCESS</span>
ip dhcp
ping 10.20.70.20
<span class="c">! on ACCESS</span>
show port-access clients</pre>
<pre class="out">Port     MAC               Method   Role         VLAN  Status
1/1/3    00:50:2f:e9:9a:01 dot1x    EMPLOYEE     10    Authorized
1/1/4    00:50:2f:e9:9a:02 dot1x    <span class="hl">CONTRACTOR</span>   <span class="hl">20</span>    Authorized</pre>
<p>Lab output, representative of the layout (the real command prints similar columns). Alice is untouched, Bob is in VLAN 20. Also check the Summary tab: Bob's record should now show Roles [User Authenticated], CONTRACTOR and Profiles EP-CONTRACTOR.</p>

<h3>Checklist when it does not work</h3>
<ul>
<li>Still 9010: did the role mapping rule match? Compare the real Department value and the rule value letter by letter.</li>
<li>Role shows but the profile is wrong: is the policy rule written on Tips:Role with the exact ClearPass role name?</li>
<li>Accepted but not in VLAN 20: compare the Output tab value with the switch role name, then check <code>show port-access role CONTRACTOR</code>.</li>
<li>Nothing changed: has the client authenticated again since your edit?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Creating the profile but forgetting the policy rule. Creating the rule before the profile exists (the shell refuses it). Typing "Contractors" in one place and "Contractor" in another. Testing Bob only and not re-checking Alice.</p></div>
<div class="exam"><p><b>Exam trap.</b> To give a new group access, you normally touch the role mapping, the enforcement policy and a profile, in that logical order. Changing only one of them leaves the chain broken at the next stage.</p></div>

<div class="scn"><h4>The new vendor team</h4><p>A vendor team of twenty people arrived on Monday. Their accounts carried Department=Vendor. The network engineer did not create a new service. She added a role VENDOR, one role mapping rule on the Department attribute, one profile returning the switch role VENDOR (VLAN 25) and one policy rule. Total time fifteen minutes, no change to the existing staff, and the Access Tracker showed the new role in the first vendor record.</p><p><b>Lesson:</b> one new group costs one role, one mapping rule, one profile and one policy rule, and every user with that attribute follows.</p></div>

<div class="iv"><p class="q">"A new group of users must get a different VLAN. What do you configure?"</p><p>Strong answer: make sure their identity source provides a distinguishing attribute or group, add a role and a mapping rule, create a profile that returns the switch role (or VLAN), add a policy rule on that role, ensure the switch role and VLAN exist and are allowed on the uplink, then have a test user authenticate again and verify in the Access Tracker and on the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the alert and the Roles line first; they tell you which stage is missing.</li>
<li>One new group needs a role, a mapping rule, a profile and a policy rule.</li>
<li>The switch role must already exist with the exact name.</li>
<li>Enforcement is applied at authentication, so the client must authenticate again.</li>
<li>Verify both sides: Access Tracker and show port-access clients.</li>
</ul></div>
`,hi:`
<p>Recipe tabhi samajh aati hai jab ek baar pakaa lo. Is chapter mein aap doosre group ke liye poori chain step by step banaoge, jaise asli site par banate. Lab hai <b>cp-role-mapping</b>: "Two kinds of staff: role mapping and enforcement". Chapter ek baar padho, phir wahi commands ke saath lab karo.</p>

<h3>Situation</h3>
<p>Alice (Department Engineering) pehle se chalti hai. Bob (Department Contractor) reject hota hai, jabki password sahi hai. Topology wahi hai: LAPTOP1 port 1/1/3 par, LAPTOP2 1/1/4 par switch ACCESS ka, ClearPass CPPM 10.20.60.10 par, application server APP1 10.20.70.20 par. Switch par role CONTRACTOR VLAN 20 ke saath pehle se hai. Goal: LAPTOP2 VLAN 20 mein CONTRACTOR ke roop mein aur LAPTOP1 abhi bhi VLAN 10 mein EMPLOYEE ke roop mein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Contractor chain ke liye banaye jaane wale objects">
<rect x="14" y="14" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="89" y="40" text-anchor="middle" class="svg-ink" font-size="13">alice: Engineering</text>
<rect x="14" y="72" width="150" height="44" rx="8" fill="#fed7aa"/><text x="89" y="98" text-anchor="middle" class="svg-ink" font-size="13">bob: Contractor</text>
<rect x="210" y="14" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="285" y="40" text-anchor="middle" class="svg-ink" font-size="13">role ENGINEER</text>
<rect x="210" y="72" width="150" height="44" rx="8" fill="#fde68a"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="13">NAYA role</text><text x="285" y="108" text-anchor="middle" class="svg-ink" font-size="13">CONTRACTOR</text>
<rect x="406" y="14" width="140" height="44" rx="8" fill="#bae6fd"/><text x="476" y="40" text-anchor="middle" class="svg-ink" font-size="13">EP-EMPLOYEE</text>
<rect x="406" y="72" width="140" height="44" rx="8" fill="#fde68a"/><text x="476" y="92" text-anchor="middle" class="svg-ink" font-size="13">NAYA profile</text><text x="476" y="108" text-anchor="middle" class="svg-ink" font-size="13">EP-CONTRACTOR</text>
<rect x="560" y="14" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="40" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10</text>
<rect x="560" y="72" width="70" height="44" rx="8" fill="#e2e8f0"/><text x="595" y="98" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20</text>
<g stroke="#64748b" stroke-width="2"><line x1="164" y1="36" x2="210" y2="36"/><line x1="164" y1="94" x2="210" y2="94"/><line x1="360" y1="36" x2="406" y2="36"/><line x1="360" y1="94" x2="406" y2="94"/><line x1="546" y1="36" x2="560" y2="36"/><line x1="546" y1="94" x2="560" y2="94"/></g>
<text x="320" y="156" text-anchor="middle" class="svg-accent" font-size="13">Yellow boxes teen cheezein hain jo aap jodte ho. Switch role CONTRACTOR pehle se hai.</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">attribute, role mapping rule, policy rule, profile, switch role</text>
</svg><p class="cap">Ek role, ek role mapping rule, ek profile aur ek policy rule jodo. Baaki kuch nahi badalta.</p></div>

<h3>Step 0: pehle failure padho</h3>
<p>Kuch badalne se pehle facts nikalo. GUI path: Monitoring &gt; Live Monitoring &gt; Access Tracker, bob ki latest request kholo. Lab shell: <code>monitoring access-tracker detail bob alerts</code> aur <code>monitoring access-tracker detail bob summary</code>.</p>
<pre class="out">Alerts
------
  Error Code                : <span class="hl">9010</span>
  Error Category            : Enforcement
  Error Message             : No enforcement rule matched (default profile [Deny Access Profile])</pre>
<p>Lab output, layout representative hai. Authentication succeed hui (215, 216 ya 217 nahi). Summary mein Roles ke neeche sirf [User Authenticated] hai. To pehla missing piece role mapping mein hai, aur doosra enforcement mein.</p>

<h3>Step 1: ClearPass role aur role mapping rule</h3>
<p>GUI path: Configuration &gt; Identity &gt; Roles &gt; Add, naam CONTRACTOR. Phir Configuration &gt; Identity &gt; Role Mappings &gt; RM-WIRED &gt; Rules &gt; Add: local user repository ke Department attribute par condition EQUALS Contractor, role CONTRACTOR. Lab shell:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR</pre>

<h3>Step 2: profile</h3>
<p>GUI path: Configuration &gt; Enforcement &gt; Profiles &gt; Add, RADIUS-type profile EP-CONTRACTOR, attribute Radius:Aruba:Aruba-User-Role aur value CONTRACTOR. Value ko bilkul waise type karo jaise switch role ki spelling hai.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR</pre>

<h3>Step 3: enforcement policy rule</h3>
<p>GUI path: Configuration &gt; Enforcement &gt; Policies &gt; EPOL-WIRED &gt; Rules &gt; Add, condition Tips:Role EQUALS CONTRACTOR, profile EP-CONTRACTOR.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  2. if Tips:Role EQUALS <span class="hl">CONTRACTOR</span> then <span class="hl">EP-CONTRACTOR</span></pre>
<p>Lab output, layout representative hai. Naya rule end mein judta hai. Yahan yeh safe hai, kyunki dono conditions ek doosre ko exclude karti hain, lekin agle chapter mein dekhoge ki rules overlap kar sakte hon to position matter karti hai.</p>

<h3>Step 4: Bob ko dobara authenticate karwao aur prove karo</h3>
<p>Enforcement tabhi chalta hai jab client authenticate karta hai. Bob ka port failed state mein hai aur switch apne quiet period (model mein 20 second) ke baad retry karta hai. Aap port bounce bhi kar sakte ho. Phir laptop par address renew karo (<code>ip dhcp</code>) aur server ko ping karo. Switch par verify karo:</p>
<pre class="code"><span class="c">! Lab shell, pehle LAPTOP2 phir ACCESS</span>
ip dhcp
ping 10.20.70.20
<span class="c">! ACCESS par</span>
show port-access clients</pre>
<pre class="out">Port     MAC               Method   Role         VLAN  Status
1/1/3    00:50:2f:e9:9a:01 dot1x    EMPLOYEE     10    Authorized
1/1/4    00:50:2f:e9:9a:02 dot1x    <span class="hl">CONTRACTOR</span>   <span class="hl">20</span>    Authorized</pre>
<p>Lab output, layout representative hai (asli command bhi isi tarah ke columns print karta hai). Alice ko chhua nahi gaya, Bob VLAN 20 mein hai. Summary tab bhi dekho: Bob ke record mein ab Roles [User Authenticated], CONTRACTOR aur Profiles EP-CONTRACTOR dikhne chahiye.</p>

<h3>Kaam na kare to checklist</h3>
<ul>
<li>Abhi bhi 9010: kya role mapping rule match hua? Asli Department value aur rule value ko akshar-ba-akshar milao.</li>
<li>Role dikhta hai lekin profile galat: kya policy rule Tips:Role par exact ClearPass role naam ke saath likha hai?</li>
<li>Accepted lekin VLAN 20 mein nahi: Output tab ki value switch role naam se milao, phir <code>show port-access role CONTRACTOR</code> dekho.</li>
<li>Kuch nahi badla: kya aapke edit ke baad client ne dobara authenticate kiya?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Profile banana lekin policy rule bhool jaana. Profile exist hone se pehle rule banana (shell mana kar deta hai). Ek jagah "Contractors" aur doosri jagah "Contractor" likhna. Sirf Bob ko test karna aur Alice dobara check na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Naye group ko access dene ke liye aap aam taur par role mapping, enforcement policy aur ek profile ko chhuoge, isi logical order mein. Sirf ek ko badalne se chain agle stage par tooti rehti hai.</p></div>

<div class="scn"><h4>Naya vendor team</h4><p>Monday ko bees logon ki vendor team aayi. Unke accounts mein Department=Vendor tha. Network engineer ne nayi service nahi banayi. Usne role VENDOR, Department attribute par ek role mapping rule, switch role VENDOR (VLAN 25) return karne wala ek profile aur ek policy rule jodha. Kul samay pandrah minute, maujooda staff mein koi change nahi, aur Access Tracker ne pehle vendor record mein hi naya role dikha diya.</p><p><b>Seekh:</b> ek naye group ka kharcha ek role, ek mapping rule, ek profile aur ek policy rule hai, aur us attribute wala har user follow karta hai.</p></div>

<div class="iv"><p class="q">"Users ke naye group ko alag VLAN dena hai. Aap kya configure karoge?"</p><p>Strong answer: pakka karo ki unka identity source koi distinguishing attribute ya group deta hai, role aur mapping rule jodo, aisa profile banao jo switch role (ya VLAN) return kare, us role par policy rule jodo, switch role aur VLAN exist karte hain aur uplink par allowed hain yeh confirm karo, phir test user ko dobara authenticate karwao aur Access Tracker aur switch par verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle alert aur Roles line padho; woh batati hain kaunsa stage missing hai.</li>
<li>Ek naye group ko role, mapping rule, profile aur policy rule chahiye.</li>
<li>Switch role pehle se exact naam ke saath exist karna chahiye.</li>
<li>Enforcement authentication par lagta hai, isliye client ko dobara authenticate karna padta hai.</li>
<li>Dono side verify karo: Access Tracker aur show port-access clients.</li>
</ul></div>
`}};export{e as default};