var e={id:`flex-profile`,h:{en:`The flex profile: the branch rulebook`,hi:`Flex profile: branch ki rulebook`},body:{en:`
<p>Every franchise shop gets a printed rulebook from head office: which door is the main entrance, which price list applies, who to call if the phone line is cut. The <b>flex profile</b> is that rulebook for a branch AP. It is a reusable object: you write it once for Pune and every Pune AP uses it.</p>

<h3>What lives in a flex profile</h3>
<dl class="terms">
<dt>Native VLAN id</dt><dd>The VLAN that the AP management traffic uses, untagged, on its switch port. It must equal the <b>trunk native VLAN</b> on the switch. Default is 1.</dd>
<dt>VLAN name and VLAN id mapping</dt><dd>A table that tells the AP which VLAN number a policy VLAN means at this branch. The same name can map to different ids in different branches.</dd>
<dt>ACL policy</dt><dd>Names of ACLs that the AP applies to the VLANs (see chapter 6). Stored and shown in the labs, not enforced.</dd>
<dt>ARP caching</dt><dd>Lets the AP answer ARP for clients to reduce broadcast load on the radio. Stored and shown only.</dd>
<dt>Local authentication group</dt><dd>The RADIUS server group the AP contacts when it authenticates 802.1X clients itself (chapter 7).</dd>
</dl>
<p>Real flex profiles hold more (for example multicast overridden interface, fallback radio shut, local users for LEAP and EAP-FAST, an efficient image upgrade setting). Those are <b>concept only</b> here; check the configuration guide of your release for the exact syntax.</p>

<h3>The built-in default</h3>
<p>The controller has <code>default-flex-profile</code>. It cannot be deleted, and it is only printed in the running configuration when somebody changed it. A site tag with <code>no local-site</code> and no flex profile named uses the default one, which has native VLAN 1 and no VLAN mapping. That is rarely correct for a real branch, so create your own.</p>

<h3>Configuration walkthrough</h3>
<pre class="code"><span class="c">! lab 1: the Pune flex profile</span>
wireless profile flex FLEX-PUNE
 description Pune branch
 native-vlan-id 210
 vlan-name STAFF-PUN
  vlan-id 220
 exit</pre>
<ul>
<li><code>native-vlan-id 210</code>: the AP management VLAN of Pune (10.30.10.0/24) on trunk native.</li>
<li><code>vlan-name STAFF-PUN</code> enters a small sub-mode; <code>vlan-id 220</code> sets the number for that name. Prompt names: <code>config-wireless-flex-profile</code> and <code>config-wireless-flex-profile-vlan</code>.</li>
<li>Inside the VLAN sub-mode, the parent commands still work, like in IOS.</li>
</ul>
<p>In the web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b>, <b>Add</b>, give the name, set the <b>Native VLAN ID</b> on the General tab, then open the <b>VLAN</b> tab and add the name and id.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless profile flex summary
Number of Flex Profiles: 2

Flex Profile Name                  Description
-----------------------------------------------------
default-flex-profile               default flex profile
<span class="hl">FLEX-PUNE                          Pune branch</span>

WLC1# show wireless profile flex detailed FLEX-PUNE
Flex Profile Name                 : FLEX-PUNE
Description                       : Pune branch
<span class="hl">Native VLAN ID                    : 210</span>
ARP Caching                       : DISABLED
Local Authentication RADIUS group : (none)

VLAN Configuration
VLAN Name                         VLAN ID
-----------------------------------------------------
<span class="hl">STAFF-PUN                         220</span>

Policy ACLs: (none)

Site tags using this profile (no local-site): SITE-PUNE</pre>
<p>The last line is the link to the next chapter: a profile does nothing until a flex site tag points at it and an AP wears that tag.</p>

<h3>Errors are atomic</h3>
<p>A bad command leaves the state unchanged, which makes labs safe to repeat. The model refuses: bad names, an id outside 1 to 4094, a local-auth group that does not exist (<code>aaa group server radius RG-PUN</code> must be defined first), deleting the default profile, deleting a profile that a site tag uses, and mapping a VLAN id twice.</p>
<pre class="out">WLC1(config-wireless-flex-profile)# local-auth radius-server-group RG-PUN
% RADIUS server group RG-PUN is not defined (aaa group server radius RG-PUN).
WLC1(config-wireless-flex-profile-vlan)# vlan-id 220
% VLAN id 220 is already mapped by VLAN name STAFF-PUN.</pre>

<div class="eg"><p><b>Worked example.</b> Mumbai has a staff VLAN 20 and Pune has VLAN 220. The policy profile PP-STAFF-PUN says <code>vlan 220</code>. In FLEX-PUNE you map <code>vlan-name STAFF-PUN</code> to <code>vlan-id 220</code>. A second branch, Chennai, can use another flex profile that maps the same VLAN name to id 320 and a policy that names the VLAN instead of the number: one policy, two branches, two different numbers. The simulator accepts either form in the policy (a number or a name) and resolves it through the flex profile.</p></div>

<div class="warn"><p><b>Common mistake.</b> A typo in the id, such as <code>vlan-id 202</code> instead of 220. Everything accepts it, nothing complains, and the client simply lands in the wrong VLAN. Lab 2 is exactly this fault. Always verify with <code>show wireless profile flex detailed</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> The flex profile and the policy profile both mention VLANs. The policy profile says <b>which</b> VLAN the WLAN wants; the flex profile says <b>what that VLAN is at this branch</b>. If the policy VLAN is missing from the flex profile, the client falls back to the native VLAN.</p></div>

<div class="scn"><h4>Two branches, one policy</h4><p>A bank with 60 branches used the same policy profile everywhere, naming the VLAN <code>STAFF</code>. Each branch had its own flex profile mapping STAFF to the local numbering (some used 20, some 120, some 220). New branches needed only a new flex profile, a site tag and a switch config; no new WLANs or policies.</p><p><b>Lesson:</b> the flex profile absorbs the differences between branches, so everything else can be shared.</p></div>

<div class="iv"><p class="q">"What is in a flex profile and why is it separate from the policy profile?"</p><p>The flex profile holds site-level facts: native VLAN, VLAN id mappings, ACLs, local auth group. The policy profile holds WLAN-level choices: switching, VLAN, QoS. Keeping them apart means one policy can serve many branches that number their VLANs differently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The flex profile is the per-branch rulebook: native VLAN, VLAN mapping, ACLs, ARP caching, local auth group.</li>
<li><code>default-flex-profile</code> exists, cannot be deleted and has native VLAN 1.</li>
<li>Native VLAN must match the switch trunk native VLAN.</li>
<li>ACL policy and ARP caching are stored and shown in the labs, not enforced.</li>
<li>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex.</li>
</ul></div>
`,hi:`
<p>Har franchise shop ko head office se ek printed rulebook milti hai: main entrance kaunsa hai, kaunsi price list lagti hai, phone line kat jaye to kise call karna hai. <b>Flex profile</b> branch AP ki wahi rulebook hai. Yeh ek reusable object hai: Pune ke liye ek baar likho aur har Pune AP use use karta hai.</p>

<h3>Flex profile mein kya hota hai</h3>
<dl class="terms">
<dt>Native VLAN id</dt><dd>Woh VLAN jo AP management traffic apne switch port par untagged use karta hai. Yeh switch ke <b>trunk native VLAN</b> ke barabar hona chahiye. Default 1 hai.</dd>
<dt>VLAN name aur VLAN id mapping</dt><dd>Ek table jo AP ko batati hai ki is branch par policy VLAN ka matlab kaunsa VLAN number hai. Ek hi name alag branches mein alag ids se map ho sakta hai.</dd>
<dt>ACL policy</dt><dd>ACLs ke naam jo AP VLANs par lagata hai (chapter 6). Labs mein stored aur shown, enforce nahi.</dd>
<dt>ARP caching</dt><dd>AP clients ke liye ARP ka jawab khud de sakta hai taaki radio par broadcast load kam ho. Sirf stored aur shown.</dd>
<dt>Local authentication group</dt><dd>Woh RADIUS server group jise AP 802.1X clients ko khud authenticate karte waqt contact karta hai (chapter 7).</dd>
</dl>
<p>Asli flex profiles mein aur bhi hota hai (jaise multicast overridden interface, fallback radio shut, LEAP aur EAP-FAST ke local users, efficient image upgrade setting). Yeh yahan <b>concept only</b> hain; exact syntax ke liye apne release ki configuration guide dekho.</p>

<h3>Built-in default</h3>
<p>Controller mein <code>default-flex-profile</code> hota hai. Use delete nahi kar sakte, aur running configuration mein tabhi print hota hai jab kisi ne use badla ho. <code>no local-site</code> wala site tag jo koi flex profile naam nahi leta woh default wala use karta hai, jisme native VLAN 1 hai aur koi VLAN mapping nahi. Asli branch ke liye yeh shayad hi sahi ho, isliye apna banao.</p>

<h3>Configuration walkthrough</h3>
<pre class="code"><span class="c">! lab 1: Pune flex profile</span>
wireless profile flex FLEX-PUNE
 description Pune branch
 native-vlan-id 210
 vlan-name STAFF-PUN
  vlan-id 220
 exit</pre>
<ul>
<li><code>native-vlan-id 210</code>: Pune ka AP management VLAN (10.30.10.0/24) trunk native par.</li>
<li><code>vlan-name STAFF-PUN</code> ek chhote sub-mode mein jata hai; <code>vlan-id 220</code> us name ka number set karta hai. Prompt names: <code>config-wireless-flex-profile</code> aur <code>config-wireless-flex-profile-vlan</code>.</li>
<li>VLAN sub-mode ke andar parent commands IOS ki tarah abhi bhi chalte hain.</li>
</ul>
<p>Web UI mein: <b>Configuration &gt; Tags &amp; Profiles &gt; Flex</b>, <b>Add</b>, name do, General tab par <b>Native VLAN ID</b> set karo, phir <b>VLAN</b> tab kholkar name aur id add karo.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless profile flex summary
Number of Flex Profiles: 2

Flex Profile Name                  Description
-----------------------------------------------------
default-flex-profile               default flex profile
<span class="hl">FLEX-PUNE                          Pune branch</span>

WLC1# show wireless profile flex detailed FLEX-PUNE
Flex Profile Name                 : FLEX-PUNE
Description                       : Pune branch
<span class="hl">Native VLAN ID                    : 210</span>
ARP Caching                       : DISABLED
Local Authentication RADIUS group : (none)

VLAN Configuration
VLAN Name                         VLAN ID
-----------------------------------------------------
<span class="hl">STAFF-PUN                         220</span>

Policy ACLs: (none)

Site tags using this profile (no local-site): SITE-PUNE</pre>
<p>Aakhri line agle chapter ka link hai: profile kuch nahi karta jab tak koi flex site tag use point na kare aur koi AP woh tag na pehne.</p>

<h3>Errors atomic hote hain</h3>
<p>Bura command state ko badalta nahi, isliye labs dobara karna safe hai. Model inko mana karta hai: bure names, 1 se 4094 ke bahar id, aisa local-auth group jo exist nahi karta (pehle <code>aaa group server radius RG-PUN</code> define karo), default profile delete karna, aisa profile delete karna jo site tag use karta hai, aur ek VLAN id ko do baar map karna.</p>
<pre class="out">WLC1(config-wireless-flex-profile)# local-auth radius-server-group RG-PUN
% RADIUS server group RG-PUN is not defined (aaa group server radius RG-PUN).
WLC1(config-wireless-flex-profile-vlan)# vlan-id 220
% VLAN id 220 is already mapped by VLAN name STAFF-PUN.</pre>

<div class="eg"><p><b>Worked example.</b> Mumbai mein staff VLAN 20 hai aur Pune mein VLAN 220. Policy profile PP-STAFF-PUN kehta hai <code>vlan 220</code>. FLEX-PUNE mein aap <code>vlan-name STAFF-PUN</code> ko <code>vlan-id 220</code> se map karte ho. Dusra branch, Chennai, alag flex profile use kar sakta hai jo wahi VLAN name id 320 se map kare aur policy number ke bajaye VLAN ka naam le: ek policy, do branches, do alag numbers. Simulator policy mein dono forms (number ya name) accept karta hai aur flex profile se resolve karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Id mein typo, jaise 220 ki jagah <code>vlan-id 202</code>. Sab accept kar leta hai, koi complain nahi karta, aur client bas galat VLAN mein pahunch jata hai. Lab 2 bilkul yahi fault hai. Hamesha <code>show wireless profile flex detailed</code> se verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Flex profile aur policy profile dono VLANs ka zikr karte hain. Policy profile batata hai WLAN <b>kaunsa</b> VLAN chahta hai; flex profile batata hai ki woh VLAN <b>is branch par kya hai</b>. Policy VLAN flex profile mein na ho to client native VLAN par fall back karta hai.</p></div>

<div class="scn"><h4>Do branches, ek policy</h4><p>60 branches wale ek bank ne har jagah wahi policy profile use kiya, VLAN ko <code>STAFF</code> naam se. Har branch ka apna flex profile tha jo STAFF ko local numbering se map karta tha (kuch 20, kuch 120, kuch 220). Naye branch ko sirf naya flex profile, ek site tag aur switch config chahiye tha; naye WLANs ya policies nahi.</p><p><b>Lesson:</b> flex profile branches ke beech ke farq absorb kar leta hai, isliye baaki sab share ho sakta hai.</p></div>

<div class="iv"><p class="q">"Flex profile mein kya hota hai aur woh policy profile se alag kyun hai?"</p><p>Flex profile site-level facts rakhta hai: native VLAN, VLAN id mappings, ACLs, local auth group. Policy profile WLAN-level choices rakhta hai: switching, VLAN, QoS. Alag rakhne se ek policy ek se zyada branches serve kar sakti hai jo VLANs ko alag number dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex profile per-branch rulebook hai: native VLAN, VLAN mapping, ACLs, ARP caching, local auth group.</li>
<li><code>default-flex-profile</code> maujood hai, delete nahi hota aur native VLAN 1 hai.</li>
<li>Native VLAN switch trunk native VLAN se match hona chahiye.</li>
<li>ACL policy aur ARP caching labs mein stored aur shown hain, enforce nahi.</li>
<li>Web UI: Configuration &gt; Tags &amp; Profiles &gt; Flex.</li>
</ul></div>
`}};export{e as default};