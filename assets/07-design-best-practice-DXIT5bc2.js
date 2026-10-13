var e={id:`design-best-practice`,h:{en:`Designing a clean rule base: least privilege, naming and safe changes`,hi:`Clean rule base design: least privilege, naming aur safe changes`},body:{en:`
<p>Anyone can make traffic flow by adding "all, all, ALL, accept". A professional makes the <b>right</b> traffic flow and nothing else. A firewall rule base is like the keys of a building: each person should hold the keys they need, not the master key. This chapter turns the mechanics of the earlier chapters into habits that pass an audit.</p>

<h3>Principle 1: least privilege</h3>
<p>Allow only the sources, destinations and services that a business need requires. Compare two ways of giving the Pune LAN internet access:</p>
<table class="cmp"><tr><th></th><th>Lazy</th><th>Least privilege</th></tr>
<tr><td>srcaddr</td><td>all</td><td>LAN_NET</td></tr>
<tr><td>dstaddr</td><td>all</td><td>all (internet) or a named list</td></tr>
<tr><td>service</td><td>ALL</td><td>WEB-DNS-PING</td></tr>
<tr><td>logtraffic</td><td>utm</td><td>all (or a reasoned choice)</td></tr></table>
<p>The lazy rule also lets an infected laptop use any protocol to any server. The strict rule lets it use web, name resolution and ping only. If a new application needs a port, you add it on purpose and the change is visible in review.</p>

<h3>Principle 2: readable and documented</h3>
<ul>
<li><b>Name</b> every policy by purpose, such as <code>LAN-to-WAN</code> or <code>MKT-SOCIAL</code>. A name tells the next engineer the intention without reading six fields.</li>
<li>Use <code>set comments</code> for the ticket or reason: <code>set comments "HR ticket 4471"</code>.</li>
<li>Prefer objects and groups over raw addresses (chapter 3), and name objects by role (<code>WEB-SERVERS</code>) rather than address.</li>
<li>Keep one purpose per policy. A policy that mixes ten unrelated sources is hard to audit and impossible to log meaningfully.</li>
</ul>
<pre class="out">FGT1 # show firewall policy 1
config firewall policy
    edit 1
        set name "BLOCK-SOCIAL"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "SOCIAL_SITE"
        set schedule "always"
        set service "ALL"
        set logtraffic all
        <span class="hl">set comments "HR ticket 4471"</span>
    next
end</pre>

<h3>Principle 3: order with intent</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Recommended list layout">
<rect x="60" y="15" width="520" height="38" rx="8" fill="#fde68a"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">1. Narrow exceptions and critical allows (one PC, one server)</text>
<rect x="60" y="60" width="520" height="38" rx="8" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">2. Explicit denies for known-bad or restricted targets</text>
<rect x="60" y="105" width="520" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="13">3. General allows per department (LAN to WAN, DMZ rules)</text>
<rect x="60" y="150" width="520" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">4. Optional explicit "deny and log all" before the implicit deny</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">specific at the top, general at the bottom</text>
</svg><p class="cap">A common layout. Your company may group by interface pair first.</p></div>
<p>Many teams also group policies by interface pair (all LAN to WAN rules together, all WAN to DMZ rules together). In the GUI you can use section headers (global labels) for this. In the CLI the order is simply the list order, so use <code>move</code> and verify with <code>show</code>.</p>

<h3>Principle 4: change safely</h3>
<ol>
<li><b>Lookup first.</b> Run the policy lookup before and after the change. The ID you expect should appear.</li>
<li><b>Disable, then delete.</b> Setting <code>status disable</code> removes a policy from matching but keeps it for rollback. Delete only after a quiet period with no hits.</li>
<li><b>Add new above old</b> when replacing, test, then remove the old.</li>
<li><b>Use comments and a ticket number</b> so the history explains itself.</li>
</ol>
<pre class="out">FGT1 # show firewall policy 2
config firewall policy
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
        <span class="hl">set status disable</span>
    next
end</pre>
<p>A disabled policy is skipped as if it were not in the list. If it was the only allow rule, users are cut off immediately, so disable during a change window and watch the counters.</p>
<p>Remember that policy changes affect <b>new sessions</b>. FortiOS has a system option that decides whether existing sessions are re-checked after a change (<code>firewall-session-dirty</code> under <code>config system settings</code>), with values such as <code>check-all</code> and <code>check-new</code>. That table is not available in the simulator, so treat this as a reference (not run in the simulator). The exam expects you to know that old sessions can outlive a deny rule unless they are cleared or re-checked.</p>

<h3>Zones, interfaces and inspection mode in short</h3>
<ul>
<li>A <b>zone</b> (<code>config system zone</code>) groups interfaces so one policy covers several ports. It saves policies, but traffic inside a zone is only inspected if you enable intra-zone traffic handling.</li>
<li><code>inspection-mode flow</code> is the default and is fast. <code>proxy</code> terminates sessions for deeper inspection and some features. Security profiles (antivirus, web filter, IPS) attach to accept policies; they are covered in later modules.</li>
<li>The implicit deny always ends the list. Do not rely on it for documentation; a final explicit deny with <code>logtraffic all</code> makes the intent and the evidence visible.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An audit finds <code>any-any-ALL</code> on port2 to port1. You plan the fix: create LAN_NET and WEB-DNS-PING, add the narrow policy above the old one, run a lookup for 10.0.1.10 on TCP 80 (expect the new ID), watch counters for a day, set the old policy to <code>status disable</code>, wait a week, then delete. At no point did users lose service.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> "Temporary" any-any rules that become permanent; policies with no name or comment; one giant policy for everything; deleting a rule that was still the only path for a legacy app; trusting the GUI order without reading the list again after a drag and drop.</p></div>
<div class="exam"><p><b>Exam trap.</b> Disabled policies are skipped, not "denied". A policy that logs nothing can still pass traffic. Which setting is wrong in "least privilege"? <code>service ALL</code> and <code>dstaddr all</code> on a server-facing rule.</p></div>

<div class="scn"><h4>The migration that kept the old rule</h4><p>A branch moved from a legacy firewall. The old rule base had 380 rules; hit counters showed 61 in use. The team imported only the used rules, rewrote them with objects and names, and left the others out. Two weeks later one forgotten monthly job failed. The log showed a deny from policy 0 and the job's owner opened a ticket. A single narrow policy was added in minutes.</p><p><b>Lesson:</b> counters and logs let you shrink a rule base safely, and they also explain the rare surprise.</p></div>

<div class="iv"><p class="q">"How do you keep a firewall rule base clean over several years?"</p><p>Least privilege per policy, objects and groups instead of raw IPs, names and comments with ticket references, specific-above-general ordering, explicit deny and logging for sensitive segments, and regular review of hit counts. Mention disable-then-delete and testing changes with the lookup tool first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Least privilege: narrow source, destination and service, never "all, all, ALL" by habit.</li>
<li>Name policies, add comments with a ticket, and use objects and groups.</li>
<li>Specific exceptions and denies go above general allows; verify the order after a move.</li>
<li>Disable first, delete later; changes act on new sessions unless the session-dirty setting says otherwise.</li>
<li>Review hit counters regularly to find unused or shadowed policies.</li>
</ul></div>
`,hi:`
<p>Koi bhi "all, all, ALL, accept" daalkar traffic chala sakta hai. Professional <b>sahi</b> traffic chalata hai aur kuch nahi. Firewall rule base building ki chaabiyon jaisa hai: har vyakti ke paas wahi chaabi honi chahiye jo use chahiye, master key nahi. Yeh chapter pichhle chapters ke mechanics ko aisi aadaton mein badalta hai jo audit pass karein.</p>

<h3>Principle 1: least privilege</h3>
<p>Sirf wahi sources, destinations aur services allow karo jo business need maangti hai. Pune LAN ko internet access dene ke do tareeke compare karo:</p>
<table class="cmp"><tr><th></th><th>Lazy</th><th>Least privilege</th></tr>
<tr><td>srcaddr</td><td>all</td><td>LAN_NET</td></tr>
<tr><td>dstaddr</td><td>all</td><td>all (internet) ya named list</td></tr>
<tr><td>service</td><td>ALL</td><td>WEB-DNS-PING</td></tr>
<tr><td>logtraffic</td><td>utm</td><td>all (ya soch-samajh ka choice)</td></tr></table>
<p>Lazy rule infected laptop ko kisi bhi server par kisi bhi protocol ka use karne deta hai. Strict rule use sirf web, name resolution aur ping karne deta hai. Nayi application ko port chahiye to aap use jaanbujhkar add karte ho aur change review mein dikhta hai.</p>

<h3>Principle 2: readable aur documented</h3>
<ul>
<li>Har policy ko purpose se <b>naam</b> do, jaise <code>LAN-to-WAN</code> ya <code>MKT-SOCIAL</code>. Naam agle engineer ko chhe fields padhe bina intention batata hai.</li>
<li>Ticket ya reason ke liye <code>set comments</code> use karo: <code>set comments "HR ticket 4471"</code>.</li>
<li>Raw addresses ki jagah objects aur groups ko prefer karo (chapter 3), aur objects ka naam address ki jagah role se rakho (<code>WEB-SERVERS</code>).</li>
<li>Ek policy, ek purpose. Dus alag sources mix karne wali policy audit karna mushkil aur meaningfully log karna namumkin hai.</li>
</ul>
<pre class="out">FGT1 # show firewall policy 1
config firewall policy
    edit 1
        set name "BLOCK-SOCIAL"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "SOCIAL_SITE"
        set schedule "always"
        set service "ALL"
        set logtraffic all
        <span class="hl">set comments "HR ticket 4471"</span>
    next
end</pre>

<h3>Principle 3: intent ke saath order</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Recommended list layout">
<rect x="60" y="15" width="520" height="38" rx="8" fill="#fde68a"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">1. Narrow exceptions aur critical allows (ek PC, ek server)</text>
<rect x="60" y="60" width="520" height="38" rx="8" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">2. Known-bad ya restricted targets ke liye explicit denies</text>
<rect x="60" y="105" width="520" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="13">3. Department ke general allows (LAN to WAN, DMZ rules)</text>
<rect x="60" y="150" width="520" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">4. Optional explicit "deny and log all" implicit deny se pehle</text>
<text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">specific upar, general neeche</text>
</svg><p class="cap">Ek common layout. Aapki company pehle interface pair se group kar sakti hai.</p></div>
<p>Kai teams policies ko interface pair se bhi group karti hain (saare LAN to WAN rules saath, saare WAN to DMZ rules saath). GUI mein iske liye section headers (global labels) use hote hain. CLI mein order bas list order hai, isliye <code>move</code> use karo aur <code>show</code> se verify karo.</p>

<h3>Principle 4: change safely karo</h3>
<ol>
<li><b>Pehle lookup.</b> Change se pehle aur baad policy lookup chalao. Jo ID aap expect karte ho wahi dikhni chahiye.</li>
<li><b>Pehle disable, phir delete.</b> <code>status disable</code> policy ko matching se hata deta hai lekin rollback ke liye rakhta hai. Delete tabhi karo jab kuch der koi hit na aaye.</li>
<li>Replace karte waqt <b>naya purane ke upar</b> daalo, test karo, phir purana hatao.</li>
<li><b>Comments aur ticket number</b> use karo taaki history khud explain kare.</li>
</ol>
<pre class="out">FGT1 # show firewall policy 2
config firewall policy
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
        <span class="hl">set status disable</span>
    next
end</pre>
<p>Disabled policy aise skip hoti hai jaise list mein hai hi nahi. Agar yahi akeli allow rule thi to users turant kat jaate hain, isliye change window mein disable karo aur counters dekho.</p>
<p>Yaad rakho policy changes <b>naye sessions</b> par asar karte hain. FortiOS mein ek system option hai jo tay karta hai ki change ke baad existing sessions dobara check hon ya nahi (<code>config system settings</code> ke neeche <code>firewall-session-dirty</code>), jiski values <code>check-all</code> aur <code>check-new</code> jaisi hain. Yeh table simulator mein available nahi hai, isliye ise reference samjho (not run in the simulator). Exam mein yeh jaanna zaroori hai ki purane sessions deny rule ke baad bhi chal sakte hain jab tak clear ya re-check na hon.</p>

<h3>Zones, interfaces aur inspection mode, sankshep mein</h3>
<ul>
<li><b>Zone</b> (<code>config system zone</code>) interfaces ko group karta hai taaki ek policy kai ports cover kare. Policies bachti hain, lekin zone ke andar ka traffic tabhi inspect hota hai jab aap intra-zone traffic handling enable karo.</li>
<li><code>inspection-mode flow</code> default hai aur tez hai. <code>proxy</code> deeper inspection aur kuch features ke liye sessions terminate karta hai. Security profiles (antivirus, web filter, IPS) accept policies se attach hote hain; unka zikr aage ke modules mein hai.</li>
<li>Implicit deny hamesha list ke end mein hota hai. Documentation ke liye us par depend mat karo; <code>logtraffic all</code> ke saath aakhri explicit deny intent aur saboot dono dikhata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Audit mein port2 se port1 par <code>any-any-ALL</code> milta hai. Aap fix plan karte ho: LAN_NET aur WEB-DNS-PING banao, narrow policy purani ke upar daalo, 10.0.1.10 TCP 80 ke liye lookup chalao (nayi ID expect karo), ek din counters dekho, purani policy ko <code>status disable</code> karo, ek hafta ruko, phir delete karo. Kisi bhi point par users ki service nahi gayi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> "Temporary" any-any rules jo permanent ho jaate hain; bina naam ya comment ki policies; sab kuch ke liye ek giant policy; woh rule delete karna jo legacy app ka akela path tha; drag and drop ke baad list dobara padhe bina GUI order par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Disabled policies skip hoti hain, "denied" nahi. Jo policy kuch log nahi karti woh phir bhi traffic pass kar sakti hai. "Least privilege" mein kaunsi setting galat hai? Server-facing rule par <code>service ALL</code> aur <code>dstaddr all</code>.</p></div>

<div class="scn"><h4>Migration jisme purana rule rakha gaya</h4><p>Ek branch legacy firewall se move hua. Purane rule base mein 380 rules the; hit counters ne 61 in use dikhaye. Team ne sirf used rules import kiye, unhe objects aur names ke saath dobara likha, aur baaki chhod diye. Do hafte baad ek bhooli hui monthly job fail hui. Log mein policy 0 ka deny dikha aur job ke owner ne ticket khola. Ek narrow policy minutes mein add ho gayi.</p><p><b>Lesson:</b> counters aur logs rule base ko safely chhota karne dete hain, aur kabhi-kabhar ki surprise bhi explain karte hain.</p></div>

<div class="iv"><p class="q">"Kai saalon tak firewall rule base ko clean kaise rakhte ho?"</p><p>Har policy mein least privilege, raw IPs ki jagah objects aur groups, ticket reference ke saath names aur comments, specific-above-general ordering, sensitive segments ke liye explicit deny aur logging, aur hit counts ka regular review. Disable-then-delete aur change ko pehle lookup tool se test karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Least privilege: narrow source, destination aur service, aadat se "all, all, ALL" kabhi nahi.</li>
<li>Policies ko naam do, ticket ke saath comments daalo, aur objects aur groups use karo.</li>
<li>Specific exceptions aur denies general allows ke upar; move ke baad order verify karo.</li>
<li>Pehle disable, baad mein delete; changes naye sessions par chalte hain jab tak session-dirty setting kuch aur na kahe.</li>
<li>Unused ya shadowed policies dhoondne ke liye hit counters ka regular review karo.</li>
</ul></div>
`}};export{e as default};