var e={id:`local-overrides-and-governance`,h:{en:`Local overrides, force-template-values and governance`,hi:`Local overrides, force-template-values aur governance`},body:{en:`
<p>A school sends a standard timetable to every branch. One day a branch teacher, in a hurry, writes a different period on her own copy with a pen. Next year's printed timetable arrives, but she keeps using her pen note, because it is written on her desk, closer to her than the new paper. A <b>local override</b> is that pen note: a value typed directly on a firewall for something the template also sets. In the lab, the local value wins over the template.</p>

<h3>How overrides happen</h3>
<p>Almost always in a hurry. At night something breaks, the on-call engineer logs in to the firewall, changes an address, and the problem is fixed. Nobody records it, nobody removes it. Months later the template says one thing and the box does another. That is <b>override drift</b>.</p>

<h3>What a normal push does with an override</h3>
<p>A normal push does not remove it. The push succeeds, the inventory says In Sync, and still the firewall uses the local value. This is the most confusing symptom in the module, so train your eye with the two views of the same box.</p>
<pre class="code">NK-PUNE-PA&gt; show config pushed-template
...
      ethernet1/2 {
        layer3 {
          ip 10.1.1.1/24;      <span class="c">what Panorama sent</span>
...
NK-PUNE-PA&gt; show config running
...
      ethernet1/2 {
        layer3 {
          ip {
            10.1.1.254/24;     <span class="c">what the firewall really uses</span>
          }</pre>
<p>The two disagree: that is the fingerprint of an override. A third lab, <code>pn-tpl-override</code>, builds exactly this situation.</p>

<h3>Two ways to remove it</h3>
<table class="tbl"><thead><tr><th>Method</th><th>How</th><th>When to use</th></tr></thead><tbody>
<tr><td>Delete the local value on the firewall</td><td>delete the setting locally and commit</td><td>One or two known overrides, you are logged in anyway</td></tr>
<tr><td>Push with force-template-values</td><td>commit-all template-stack name &lt;stack&gt; force-template-values yes</td><td>Many firewalls, you want the template to win everywhere</td></tr>
</tbody></table>
<p>In the lab, <code>force-template-values yes</code> removes local values that the template defines. Think carefully before using it: it also removes legitimate local values that the template covers. Run a <code>validate-only</code> first, use the <code>device</code> option to start with one firewall, and read the effective configuration afterwards. Exact behaviour of the option in your product version is described in the documentation for your PAN-OS version.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK force-template-values yes device &lt;serial&gt;</pre>

<h3>Governance: stop drift before it starts</h3>
<ul>
<li><b>Rule:</b> anything in the branch standard changes in the template, not on the box.</li>
<li><b>Break-glass:</b> emergency local changes are allowed, but logged in the ticket with a removal date.</li>
<li><b>Detect:</b> compare pushed-template with running on a sample of firewalls on a schedule.</li>
<li><b>Own:</b> every template has an owner and a description.</li>
<li><b>Roles:</b> limit who may edit shared templates; the more shared, the fewer editors.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using force-template-values on all firewalls as a reflex whenever something looks wrong. It removes local values the template defines, including ones someone needed on purpose.</p></div>
<div class="exam"><p><b>Exam trap.</b> "In Sync" tells you the push was applied. It does not prove the effective value equals the template value; a local override can still win.</p></div>

<div class="scn"><h4>The emergency address nobody removed</h4><p>During an outage a Pune engineer typed a different LAN gateway address by hand. The outage ended, the ticket closed, and the hand-typed value stayed. A year later a template change to that interface seemed to do nothing in Pune only. Comparing pushed-template with running found the difference in one minute. A targeted force push removed it, and the team added a rule that break-glass changes need a removal date in the ticket.</p></div>

<div class="iv"><p class="q">"A template push says succeeded and In Sync, but one firewall behaves differently. Why?"</p><p>A local override is probably winning. I compare show config pushed-template with show config running on that firewall. To fix it I delete the local value or push with force-template-values, after a validate-only and on that device first, and I then close the process gap that allowed the drift.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A local value typed on a firewall beats the template and survives a normal push.</li>
<li>Fingerprint: pushed-template and running disagree while the push shows success.</li>
<li>Fix by deleting the local value or push with force-template-values (validate first, one device first).</li>
<li>Governance: change the template, log break-glass work, audit for drift.</li>
</ul></div>
`,hi:`
<p>School har branch ko standard timetable bhejta hai. Ek din branch ki teacher jaldi mein apni copy par pen se alag period likh deti hai. Agle saal ka printed timetable aata hai, par wo apna pen wala note hi use karti hai, kyunki wo uski desk par likha hai, naye kagaz se zyada kareeb. <b>Local override</b> wahi pen note hai: firewall par seedha type ki gayi value jis cheez ko template bhi set karta hai. Lab mein local value template par jeetti hai.</p>

<h3>Overrides kaise hote hain</h3>
<p>Lagbhag hamesha jaldi mein. Raat ko kuch toot-ta hai, on-call engineer firewall mein login karke address badal deta hai, problem theek. Koi record nahi karta, koi hatata nahi. Mahine baad template kuch kehta hai aur box kuch aur karta hai. Isse <b>override drift</b> kehte hain.</p>

<h3>Normal push override ke saath kya karta hai</h3>
<p>Normal push use nahi hatata. Push succeed hota hai, inventory In Sync kehta hai, phir bhi firewall local value use karta hai. Ye module ka sabse confusing symptom hai, isliye ek hi box ke do views se nazar train karo.</p>
<pre class="code">NK-PUNE-PA&gt; show config pushed-template
...
      ethernet1/2 {
        layer3 {
          ip 10.1.1.1/24;      <span class="c">Panorama ne kya bheja</span>
...
NK-PUNE-PA&gt; show config running
...
      ethernet1/2 {
        layer3 {
          ip {
            10.1.1.254/24;     <span class="c">firewall asal mein kya use karta hai</span>
          }</pre>
<p>Dono disagree karte hain: yahi override ki fingerprint hai. Teesra lab <code>pn-tpl-override</code> bilkul yahi situation banata hai.</p>

<h3>Hatane ke do tareeke</h3>
<table class="tbl"><thead><tr><th>Method</th><th>Kaise</th><th>Kab use karein</th></tr></thead><tbody>
<tr><td>Firewall par local value delete karo</td><td>setting locally delete karo aur commit</td><td>Ek-do known overrides, tum waise bhi logged in ho</td></tr>
<tr><td>force-template-values ke saath push</td><td>commit-all template-stack name &lt;stack&gt; force-template-values yes</td><td>Bahut firewalls, template har jagah jeete</td></tr>
</tbody></table>
<p>Lab mein <code>force-template-values yes</code> wo local values hata deta hai jo template define karta hai. Use karne se pehle sochkar chalo: ye wo legitimate local values bhi hata deta hai jo template cover karta hai. Pehle <code>validate-only</code> chalao, ek firewall se shuru karne ke liye <code>device</code> option use karo, aur baad mein effective configuration padho. Option ka exact behaviour tumhare product version mein kya hai ye apne PAN-OS version ki documentation mein hai.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK force-template-values yes device &lt;serial&gt;</pre>

<h3>Governance: drift shuru hone se pehle roko</h3>
<ul>
<li><b>Rule:</b> branch standard ki har cheez template mein badlo, box par nahi.</li>
<li><b>Break-glass:</b> emergency local change allowed hai, par ticket mein removal date ke saath log hota hai.</li>
<li><b>Detect:</b> schedule par kuch firewalls ka pushed-template aur running compare karo.</li>
<li><b>Own:</b> har template ka owner aur description ho.</li>
<li><b>Roles:</b> shared templates kaun edit kar sakta hai seemit karo; jitna shared, utne kam editors.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Jab bhi kuch galat dikhe to reflex mein sab firewalls par force-template-values chalana. Ye template ki defined local values hata deta hai, wo bhi jo kisi ko jaan-boojh kar chahiye thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "In Sync" batata hai ki push apply hua. Ye prove nahi karta ki effective value template value ke barabar hai; local override ab bhi jeet sakta hai.</p></div>

<div class="scn"><h4>Emergency address jo kisi ne nahi hataya</h4><p>Outage ke dauraan Pune ke engineer ne haath se alag LAN gateway address type kiya. Outage khatam, ticket close, aur haath ki value rah gayi. Saal baad us interface ka template change sirf Pune mein kuch nahi karta dikha. Pushed-template ko running se compare karne par ek minute mein farq mila. Targeted force push ne use hataya, aur team ne rule joda ki break-glass changes ko ticket mein removal date chahiye.</p></div>

<div class="iv"><p class="q">"Template push succeeded aur In Sync kehta hai, phir bhi ek firewall alag behave karta hai. Kyun?"</p><p>Shayad local override jeet raha hai. Us firewall par show config pushed-template ko show config running se compare karta hoon. Fix ke liye local value delete karta hoon ya force-template-values ke saath push karta hoon, validate-only ke baad aur pehle usi device par, aur phir process gap band karta hoon jisne drift hone diya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall par type ki local value template ko haraati hai aur normal push se bachti hai.</li>
<li>Fingerprint: push success dikhe par pushed-template aur running disagree karein.</li>
<li>Fix: local value delete ya force-template-values push (pehle validate, pehle ek device).</li>
<li>Governance: template badlo, break-glass log karo, drift ka audit karo.</li>
</ul></div>
`}};export{e as default};