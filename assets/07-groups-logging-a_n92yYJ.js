var e={id:`groups-logging`,h:{en:`Rolling out profiles: groups, logs and a safe change plan`,hi:`Profiles ka rollout: groups, logs aur safe change plan`},body:{en:`
<p>You now know four engines. In a real network the hard part is not writing a profile; it is introducing it without breaking the business, and then proving it works. This chapter is the project plan: build, attach, monitor, tune, enforce.</p>

<h3>A five-stage rollout</h3>
<ol>
<li><b>Baseline.</b> Attach monitor-only profiles (<code>pass</code> or <code>monitor</code> everywhere, logging on) to the policy. Nobody is blocked yet.</li>
<li><b>Observe.</b> After a week, read the logs by category, application and signature. Which departments need what? Which false positives exist?</li>
<li><b>Tune.</b> Build exemptions and local ratings. Split policies if two user groups need different rules, for example staff and guests.</li>
<li><b>Enforce.</b> Switch proven entries to block, announce the change, and keep a rollback plan.</li>
<li><b>Review.</b> Quarterly, remove stale exemptions and check that FortiGuard licences and updates are current.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Rollout stages">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Baseline</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">monitor only</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Observe</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">read logs</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Tune</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">exempt, rate</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Enforce</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">block proven</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Review</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">every quarter</text>
</svg><p class="cap">A safe rollout moves from monitor to enforce with evidence at every step.</p></div>

<h3>Profile groups in practice</h3>
<p>Create one group per user class: <code>NK-STAFF</code>, <code>NK-GUEST</code>, <code>NK-SERVERS</code>. Use clear names that tell the purpose, not the author. Remember that a profile referenced by a group or a policy cannot be deleted until the reference is removed, and that cloning built-in profiles is the way to start. Below, the staff policy points at the group, and the same group could be reused for a second policy.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall profile-group
    edit "NK-STAFF"
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
    next
end
config firewall policy
    edit 10
        set name "STAFF-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set profile-type group
        set profile-group "NK-STAFF"
        set logtraffic utm
        set nat enable
    next
end</pre>
<p>Note <code>logtraffic utm</code>: it writes a traffic log only when a security profile acted on the session. <code>logtraffic all</code> logs every session, which is useful for troubleshooting but heavy on disk.</p>

<h3>Reading UTM logs</h3>
<p>Each engine writes its own log type: web filter, application control, virus, and IPS ("attack"). From the CLI you filter and display them:</p>
<pre class="code">execute log filter category 3
execute log display
execute log filter reset</pre>
<p>Category 3 is the web filter log; 2 is virus, 4 is IPS, 10 is application control, 0 is traffic. A web filter log line looks like this (<b>reference excerpt, illustrative, not captured from the simulator</b>):</p>
<pre class="out">type="utm" subtype="webfilter" eventtype="ftgd_blk" level="warning"
srcip=10.0.1.10 dstip=192.0.2.80 policyid=10 service="HTTP"
hostname="royal-casino.example" catdesc="Gambling" action="blocked"</pre>
<p>The fields you always read: <code>srcip</code> (who), <code>hostname</code> or <code>app</code> or <code>attack</code> (what), <code>catdesc</code> or severity (why), <code>action</code> (result) and <code>policyid</code> (which policy). Central log analysis in FortiAnalyzer or a SIEM builds on these same fields.</p>

<h3>Replacement messages and user experience</h3>
<p>When a web filter blocks, the user sees a replacement page; antivirus and application control also have replacement messages. Customise them with the help-desk number and a ticket link text, so users know what to do. Do not put internal detail such as the policy ID in user-facing text.</p>

<div class="eg"><p><b>Worked example.</b> Week 1: NK-WEB blocks only Malicious Websites and Phishing; Gambling, Social Networking and Streaming are <code>monitor</code>. At the end of the week the report shows 3,000 Social Networking hits, mostly marketing. HR wants it blocked for staff but marketing needs it. The team splits the policy: marketing's address range gets <code>NK-MKT</code> (Social allowed), everybody else gets <code>NK-STAFF</code> (Social blocked). Then they enforce.</p></div>

<div class="warn"><p><b>Common mistake.</b> Logging everything forever. A busy FortiGate with <code>logtraffic all</code> on every policy can fill its disk and slow down; send logs to FortiAnalyzer or a syslog server and keep <code>utm</code> logging for most policies.</p></div>
<div class="exam"><p><b>Exam trap.</b> A profile group bundles ssl-ssh-profile, antivirus, web filter, IPS and application list. The log categories are separate for each engine. <code>logtraffic utm</code> logs only sessions where a security profile acted.</p></div>

<div class="scn"><h4>The friendly rollout that avoided a Monday disaster</h4><p>A retail chain rolled out application control to 60 stores. A pilot in two stores in monitor mode showed that the point-of-sale vendor used a remote-support application the security team had planned to block. By catching it in the logs they added an exception policy for the vendor's addresses before enforcement, and the real rollout had no outage.</p><p><b>Lesson:</b> monitor logs are your test environment.</p></div>

<div class="iv"><p class="q">"How do you prove a security profile is working?"</p><p>Generate a harmless test event, such as visiting a test site in a blocked category or using a lab marker, from a client behind the policy. Then check the matching UTM log (web filter, application control, virus or IPS) for the right action and policy ID, and confirm the session in the session table points to the expected policy. Keep the evidence in the change record.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roll out in stages: baseline, observe, tune, enforce, review.</li>
<li>Use profile groups per user class and keep names meaningful.</li>
<li>logtraffic utm records sessions acted on by a profile; logtraffic all records everything.</li>
<li>Each engine has its own log category; read srcip, what, why, action and policyid.</li>
<li>Customise replacement messages for a better user experience.</li>
</ul></div>
`,hi:`
<p>Ab aap chaar engines jaante ho. Real network mein mushkil profile likhna nahi hai; mushkil use business tode bina introduce karna hai, aur phir saabit karna ki woh kaam kar raha hai. Yeh chapter project plan hai: build, attach, monitor, tune, enforce.</p>

<h3>Paanch stage ka rollout</h3>
<ol>
<li><b>Baseline.</b> Policy par monitor-only profiles (sab jagah <code>pass</code> ya <code>monitor</code>, logging on) lagao. Abhi koi block nahi.</li>
<li><b>Observe.</b> Ek hafte baad logs category, application aur signature ke hisaab se padho. Kis department ko kya chahiye? Kaun se false positives hain?</li>
<li><b>Tune.</b> Exemptions aur local ratings banao. Do user groups ko alag rules chahiye to policies split karo, jaise staff aur guests.</li>
<li><b>Enforce.</b> Proven entries block par karo, change announce karo, aur rollback plan rakho.</li>
<li><b>Review.</b> Har quarter purane exemptions hatao aur check karo ki FortiGuard licences aur updates current hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Rollout stages">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Baseline</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">sirf monitor</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Observe</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">logs padho</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Tune</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">exempt, rate</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Enforce</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">proven block</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Review</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">har quarter</text>
</svg><p class="cap">Safe rollout har step par evidence ke saath monitor se enforce tak jaata hai.</p></div>

<h3>Practice mein profile groups</h3>
<p>Har user class ke liye ek group banao: <code>NK-STAFF</code>, <code>NK-GUEST</code>, <code>NK-SERVERS</code>. Aise naam rakho jo purpose batayein, author nahi. Yaad rakho ki group ya policy se reference hua profile tab tak delete nahi hota jab tak reference na hataya jaaye, aur built-in profiles ko clone karke shuru karna sahi tareeka hai. Neeche staff policy group ko point karti hai, aur wahi group doosri policy mein reuse ho sakta hai.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall profile-group
    edit "NK-STAFF"
        set ssl-ssh-profile "certificate-inspection"
        set webfilter-profile "NK-WEB"
        set application-list "NK-APP"
        set av-profile "NK-AV"
        set ips-sensor "NK-IPS"
    next
end
config firewall policy
    edit 10
        set name "STAFF-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set profile-type group
        set profile-group "NK-STAFF"
        set logtraffic utm
        set nat enable
    next
end</pre>
<p><code>logtraffic utm</code> dekho: yeh traffic log tabhi likhta hai jab security profile ne session par action liya. <code>logtraffic all</code> har session log karta hai, troubleshooting ke liye useful lekin disk par bhaari.</p>

<h3>UTM logs padhna</h3>
<p>Har engine apna log type likhta hai: web filter, application control, virus aur IPS ("attack"). CLI se unhe filter aur display karte ho:</p>
<pre class="code">execute log filter category 3
execute log display
execute log filter reset</pre>
<p>Category 3 web filter log hai; 2 virus, 4 IPS, 10 application control, 0 traffic. Web filter log line aisi dikhti hai (<b>reference excerpt, illustrative, simulator se capture nahi kiya</b>):</p>
<pre class="out">type="utm" subtype="webfilter" eventtype="ftgd_blk" level="warning"
srcip=10.0.1.10 dstip=192.0.2.80 policyid=10 service="HTTP"
hostname="royal-casino.example" catdesc="Gambling" action="blocked"</pre>
<p>Jo fields hamesha padhte ho: <code>srcip</code> (kaun), <code>hostname</code> ya <code>app</code> ya <code>attack</code> (kya), <code>catdesc</code> ya severity (kyun), <code>action</code> (natija) aur <code>policyid</code> (kaunsi policy). FortiAnalyzer ya SIEM mein central log analysis inhi fields par bana hai.</p>

<h3>Replacement messages aur user experience</h3>
<p>Web filter block kare to user ko replacement page dikhta hai; antivirus aur application control ke bhi replacement messages hote hain. Unhe help-desk number aur ticket link ke text ke saath customise karo, taaki users ko pata ho kya karna hai. User-facing text mein policy ID jaisi internal detail mat daalo.</p>

<div class="eg"><p><b>Worked example.</b> Hafta 1: NK-WEB sirf Malicious Websites aur Phishing block karta hai; Gambling, Social Networking aur Streaming <code>monitor</code> par hain. Hafta ke end mein report 3,000 Social Networking hits dikhati hai, zyadatar marketing ke. HR chahta hai staff ke liye block ho lekin marketing ko chahiye. Team policy split karti hai: marketing ke address range ko <code>NK-MKT</code> (Social allowed), baaki sabko <code>NK-STAFF</code> (Social blocked). Phir enforce.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sab kuch hamesha log karna. Har policy par <code>logtraffic all</code> wala busy FortiGate disk bhar sakta hai aur slow ho sakta hai; logs FortiAnalyzer ya syslog server par bhejo aur zyadatar policies par <code>utm</code> logging rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profile group ssl-ssh-profile, antivirus, web filter, IPS aur application list bundle karta hai. Har engine ki log categories alag hain. <code>logtraffic utm</code> sirf wahi sessions log karta hai jinpar security profile ne action liya.</p></div>

<div class="scn"><h4>Friendly rollout jisne Monday disaster bachaya</h4><p>Ek retail chain ne 60 stores mein application control rollout kiya. Do stores ke monitor-mode pilot ne dikhaya ki point-of-sale vendor ek remote-support application use karta hai jise security team block karne wali thi. Logs mein pakad kar unhone enforcement se pehle vendor ke addresses ke liye exception policy jodi, aur asli rollout mein koi outage nahi hua.</p><p><b>Lesson:</b> monitor logs aapka test environment hain.</p></div>

<div class="iv"><p class="q">"Kaise saabit karoge ki security profile kaam kar raha hai?"</p><p>Policy ke peeche ke client se harmless test event generate karo, jaise blocked category ki test site kholna ya lab marker use karna. Phir matching UTM log (web filter, application control, virus ya IPS) mein sahi action aur policy ID check karo, aur session table mein confirm karo ki session expected policy ko point karta hai. Evidence change record mein rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages mein rollout: baseline, observe, tune, enforce, review.</li>
<li>Har user class ke liye profile group; naam meaningful rakho.</li>
<li>logtraffic utm profile-acted sessions record karta hai; logtraffic all sab kuch.</li>
<li>Har engine ki apni log category; srcip, what, why, action aur policyid padho.</li>
<li>Behtar user experience ke liye replacement messages customise karo.</li>
</ul></div>
`}};export{e as default};