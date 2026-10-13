var e={id:`profiles-and-url-filtering`,h:{en:`Security profiles, profile groups and URL filtering`,hi:`Security profiles, profile groups aur URL filtering`},body:{en:`
<p>An allow rule is like a boarding pass check: it says this passenger may go to this gate. But a good airport also scans the bag. <b>Security profiles</b> are the bag scanners. The rule decides if the flow may pass; the profiles inspect what is inside the flow. Without profiles an allow rule only checks identity, not contents.</p>

<h3>The profile family</h3>
<dl class="terms">
<dt>Antivirus (malware)</dt><dd>Looks for known malware in files and streams.</dd>
<dt>Anti-spyware</dt><dd>Detects command-and-control style behaviour and bad DNS lookups from infected hosts.</dd>
<dt>Vulnerability protection</dt><dd>Looks for traffic that tries to abuse known software flaws on servers and clients.</dd>
<dt>URL filtering</dt><dd>Allows, alerts, or blocks websites by category (for example gambling, malware, social networking).</dd>
<dt>File blocking</dt><dd>Controls file types that may cross, for example blocking executables from the internet.</dd>
<dt>WildFire analysis</dt><dd>Sends unknown files to cloud analysis so new malware can be recognised.</dd>
</dl>
<p>Exact profile names and extra options vary by release; learn the purpose of each one. Data Filtering exists as a log type in the product, but it is not covered in this course and it is one of the items that is not supported when moving a Panorama configuration to SCM (chapter on migration in the operations module).</p>

<h3>Profile groups</h3>
<p>Attaching six profiles to every rule is tedious and error-prone. A <b>security profile group</b> bundles them under one name, for example <code>corp-standard</code>. The rule points to the group, and the group points to the profiles. When the security team improves one profile, every rule using the group benefits at the next push.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Profile group">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">Allow rule</text>
<rect x="210" y="70" width="140" height="50" rx="8" fill="#fde68a"/><text x="280" y="100" text-anchor="middle" class="svg-ink" font-size="13">corp-standard</text>
<rect x="430" y="10" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="32" text-anchor="middle" class="svg-ink" font-size="12">Antivirus, Anti-spyware</text>
<rect x="430" y="55" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="77" text-anchor="middle" class="svg-ink" font-size="12">Vulnerability protection</text>
<rect x="430" y="100" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="12">URL filtering, File blocking</text>
<rect x="430" y="145" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="167" text-anchor="middle" class="svg-ink" font-size="12">WildFire analysis</text>
<line x1="150" y1="95" x2="210" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="90" x2="430" y2="27" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="430" y2="72" stroke="#64748b" stroke-width="2"/><line x1="350" y1="100" x2="430" y2="117" stroke="#64748b" stroke-width="2"/><line x1="350" y1="105" x2="430" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One group, many profiles. Rules attach the group, not each profile.</p></div>

<h3>URL filtering step by step</h3>
<ol>
<li>Pick the categories you care about. Palo Alto Networks provides a large list of predefined categories.</li>
<li>For each category choose an action: allow, alert (allow but log), or block. Block malware, command-and-control and phishing style categories at minimum.</li>
<li>Add a custom URL category for your own lists, such as <code>blocked.example</code> or an allow list for a partner site.</li>
<li>Put the URL filtering profile into the profile group.</li>
<li>Attach the group to the allow rules that go to the internet.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> The lab has an internet rule <code>allow-web-mobile</code> from the mobile users to the untrust zone with applications web-browsing and ssl. Its profile group <code>corp-standard</code> contains a URL filtering profile that blocks the category used by the lab's test domain <code>gambling-sim.example</code> and alerts on social networking. A user opens <code>news.example</code>, and the log shows allow. The user opens <code>gambling-sim.example</code>, and the URL log shows the category and the action block, and the user sees a block page.</p></div>
<pre class="out">URL log
Time      User        URL                     Category    Action   Rule
12:10:03  lab-user1   news.example            news        allow    allow-web-mobile
12:10:31  lab-user1   <span class="hl">gambling-sim.example</span>    gambling     <span class="hl">block-url</span> allow-web-mobile</pre>
<p>Notice that the rule name stays <code>allow-web-mobile</code>. The rule allowed the session; the profile blocked the request inside it. A beginner often looks for a deny rule and finds none. The answer is in the profile action.</p>

<h3>Default rules and best practice in SCM</h3>
<p>In SCM, the default rules for mobile users enforce URL blocking, malware protection and threat prevention. The documentation advises you to verify after about 15 minutes that the default protection is active. Do not remove these defaults; build your own rules above or below them in a way that you understand and can explain.</p>

<h3>Order of thought for a new internet rule</h3>
<ol>
<li>Zones: mobile users to untrust.</li>
<li>Applications: only what the business needs.</li>
<li>Action: allow.</li>
<li>Profile group: always.</li>
<li>Log at session end and forward.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Using an allow rule without a profile group; creating a profile group but forgetting to push; blocking a category and then wondering why a legitimate site breaks (the site was categorised unexpectedly; use a custom URL category exception with change approval); testing with a real malicious site instead of a safe simulated test domain.</p></div>
<div class="exam"><p><b>Exam trap.</b> A URL category block does not appear as a deny rule. The traffic log shows the allow rule, and the URL filtering log shows the category and action. Also remember that profiles apply only to traffic that matches an allow rule.</p></div>

<div class="scn"><h4>Allowed, yet blocked</h4><p>A user complained that an expense website was "blocked by the firewall", but the security team saw no deny rule. The traffic log showed allow on the internet rule. The URL log showed the site categorised in a blocked category after a vendor recategorisation. The team created a custom URL category for the approved expense domain, referenced it in the profile as allow, and documented the exception.</p><p><b>Lesson:</b> when allow and block seem to contradict, the profile is the second decision maker.</p></div>

<div class="iv"><p class="q">"What is the difference between a security rule and a security profile?"</p><p>The rule decides whether a flow may pass, based on zones, users, applications and addresses. The profile inspects the content of an allowed flow for malware, threats, URL categories and files. You attach profiles through a profile group to every allow rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules decide pass or block; profiles inspect the content of allowed flows.</li>
<li>Bundle profiles in a profile group and attach the group to every allow rule.</li>
<li>URL filtering works by category with allow, alert or block actions, plus custom categories.</li>
<li>A URL block shows in the URL log, not as a deny rule.</li>
<li>SCM default mobile-user rules enforce URL, malware and threat protection; verify them after about 15 minutes.</li>
</ul></div>
`,hi:`
<p>Allow rule boarding pass check jaisa hai: wo kehta hai ye passenger is gate par ja sakta hai. Lekin achha airport bag bhi scan karta hai. <b>Security profiles</b> bag scanners hain. Rule decide karta hai ki flow pass ho sakta hai ya nahi; profiles flow ke andar kya hai wo inspect karte hain. Profiles ke bina allow rule sirf identity check karta hai, contents nahi.</p>

<h3>Profile family</h3>
<dl class="terms">
<dt>Antivirus (malware)</dt><dd>Files aur streams mein known malware dhundhta hai.</dd>
<dt>Anti-spyware</dt><dd>Infected hosts se command-and-control jaisa behaviour aur bad DNS lookups detect karta hai.</dd>
<dt>Vulnerability protection</dt><dd>Servers aur clients ki known software flaws ka misuse karne wale traffic ko dhundhta hai.</dd>
<dt>URL filtering</dt><dd>Websites ko category ke hisaab se allow, alert ya block karta hai (jaise gambling, malware, social networking).</dd>
<dt>File blocking</dt><dd>Kaunse file types cross kar sakte hain control karta hai, jaise internet se executables block karna.</dd>
<dt>WildFire analysis</dt><dd>Unknown files ko cloud analysis ke liye bhejta hai taaki naye malware pehchaane ja sakein.</dd>
</dl>
<p>Exact profile names aur extra options release ke hisaab se badalte hain; har ek ka purpose seekho. Data Filtering product mein log type ke roop mein hai, lekin is course mein cover nahi hota aur Panorama configuration ko SCM mein migrate karte waqt wo unsupported items mein se ek hai (operations module ka migration chapter).</p>

<h3>Profile groups</h3>
<p>Har rule se chhe profiles attach karna thaka dene wala aur galti-prone hai. <b>Security profile group</b> unhe ek naam ke neeche bundle karta hai, jaise <code>corp-standard</code>. Rule group ko point karta hai, group profiles ko. Security team ek profile improve kare to group use karne wala har rule agle push par fayda uthata hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Profile group">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">Allow rule</text>
<rect x="210" y="70" width="140" height="50" rx="8" fill="#fde68a"/><text x="280" y="100" text-anchor="middle" class="svg-ink" font-size="13">corp-standard</text>
<rect x="430" y="10" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="32" text-anchor="middle" class="svg-ink" font-size="12">Antivirus, Anti-spyware</text>
<rect x="430" y="55" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="77" text-anchor="middle" class="svg-ink" font-size="12">Vulnerability protection</text>
<rect x="430" y="100" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="12">URL filtering, File blocking</text>
<rect x="430" y="145" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="525" y="167" text-anchor="middle" class="svg-ink" font-size="12">WildFire analysis</text>
<line x1="150" y1="95" x2="210" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="90" x2="430" y2="27" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="430" y2="72" stroke="#64748b" stroke-width="2"/><line x1="350" y1="100" x2="430" y2="117" stroke="#64748b" stroke-width="2"/><line x1="350" y1="105" x2="430" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek group, kai profiles. Rules har profile nahi, group attach karte hain.</p></div>

<h3>URL filtering step by step</h3>
<ol>
<li>Jin categories ki aapko parwah hai unhe chuno. Palo Alto Networks predefined categories ki badi list deta hai.</li>
<li>Har category ke liye action chuno: allow, alert (allow lekin log), ya block. Kam se kam malware, command-and-control aur phishing jaisi categories block karo.</li>
<li>Apni lists ke liye custom URL category banao, jaise <code>blocked.example</code> ya partner site ki allow list.</li>
<li>URL filtering profile ko profile group mein daalo.</li>
<li>Group ko un allow rules se attach karo jo internet jaate hain.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Lab mein ek internet rule <code>allow-web-mobile</code> hai mobile users se untrust zone tak, applications web-browsing aur ssl ke saath. Uska profile group <code>corp-standard</code> ek URL filtering profile rakhta hai jo lab ke test domain <code>gambling-sim.example</code> wali category block karta hai aur social networking par alert deta hai. User <code>news.example</code> kholta hai, log mein allow. User <code>gambling-sim.example</code> kholta hai, URL log category aur action block dikhata hai, aur user ko block page milta hai.</p></div>
<pre class="out">URL log
Time      User        URL                     Category    Action   Rule
12:10:03  lab-user1   news.example            news        allow    allow-web-mobile
12:10:31  lab-user1   <span class="hl">gambling-sim.example</span>    gambling     <span class="hl">block-url</span> allow-web-mobile</pre>
<p>Dhyan do ki rule name <code>allow-web-mobile</code> hi rehta hai. Rule ne session allow kiya; profile ne uske andar request block ki. Beginner aksar deny rule dhundhta hai aur milta nahi. Jawab profile action mein hai.</p>

<h3>SCM mein default rules aur best practice</h3>
<p>SCM mein mobile users ke default rules URL blocking, malware protection aur threat prevention enforce karte hain. Documentation salah deti hai ki lagbhag 15 minute baad verify karo ki default protection active hai. Ye defaults hatao mat; apne rules unke upar ya neeche aise banao ki aap samajh aur explain kar sako.</p>

<h3>Naye internet rule ke liye sochne ka order</h3>
<ol>
<li>Zones: mobile users se untrust.</li>
<li>Applications: sirf jo business ko chahiye.</li>
<li>Action: allow.</li>
<li>Profile group: hamesha.</li>
<li>Session end par log aur forward.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Profile group ke bina allow rule; profile group banana lekin push bhool jana; category block karke sochna ki legitimate site kyun toot gayi (site unexpectedly categorise hui thi; change approval ke saath custom URL category exception use karo); safe simulated test domain ke bajay real malicious site se test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> URL category block deny rule ke roop mein nahi dikhta. Traffic log allow rule dikhata hai, aur URL filtering log category aur action dikhata hai. Ye bhi yaad rakho ki profiles sirf us traffic par lagte hain jo allow rule se match hota hai.</p></div>

<div class="scn"><h4>Allowed, phir bhi blocked</h4><p>Ek user ne shikayat ki ki expense website "firewall ne block ki", lekin security team ko koi deny rule nahi dikha. Traffic log internet rule par allow dikha raha tha. URL log mein site vendor recategorisation ke baad blocked category mein thi. Team ne approved expense domain ke liye custom URL category banayi, profile mein allow ke roop mein reference ki, aur exception document kiya.</p><p><b>Lesson:</b> allow aur block contradict karte lagein to profile doosra decision maker hai.</p></div>

<div class="iv"><p class="q">"Security rule aur security profile mein kya fark hai?"</p><p>Rule decide karta hai ki flow pass ho sakta hai ya nahi, zones, users, applications aur addresses ke basis par. Profile allowed flow ke content mein malware, threats, URL categories aur files inspect karta hai. Profiles ko profile group ke through har allow rule se attach karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules pass ya block decide karte hain; profiles allowed flows ka content inspect karte hain.</li>
<li>Profiles ko profile group mein bundle karo aur group har allow rule se attach karo.</li>
<li>URL filtering category ke hisaab se allow, alert ya block actions aur custom categories se chalta hai.</li>
<li>URL block URL log mein dikhta hai, deny rule ke roop mein nahi.</li>
<li>SCM ke default mobile-user rules URL, malware aur threat protection enforce karte hain; lagbhag 15 minute baad verify karo.</li>
</ul></div>
`}};export{e as default};