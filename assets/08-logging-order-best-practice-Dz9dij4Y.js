var e={id:`logging-order-best-practice`,h:{en:`Log forwarding, rule order, shadowing and best practices`,hi:`Log forwarding, rule order, shadowing aur best practices`},body:{en:`
<p>Think of a security camera in a shop. A camera that records nothing is decoration. A camera that records everything but whose footage is stored in the wrong building is almost as bad. And if two guards stand at the same door, and the first always waves people in, the second guard never gets to do the job. This chapter covers the three habits that make policy trustworthy: <b>logs that arrive</b>, <b>rules in the right order</b>, and <b>rules that are as narrow as the business allows</b>.</p>

<h3>Log forwarding profiles</h3>
<p>A rule writes a log entry only if its log setting says so. A <b>log forwarding profile</b> tells the system where logs go. In the product it is under Objects, Log Forwarding. A profile has match lists for log types: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering and Authentication. Each match list picks a forward method: to Panorama or to the Strata Logging Service. All Prisma Access logs end up in the Strata Logging Service whichever tool manages the tenant (the operations module covers it in detail).</p>
<p>On the Panorama path the plugin pre-creates log settings in the templates: for example <code>system-gpcs-default</code>, <code>userid-gpcs-default</code>, <code>hipmatch-gpcs-default</code> and <code>gp-prismaaccess-default</code> in <code>Mobile_User_Template</code>. Those handle system, user and HIP logs. The log forwarding profile for <i>traffic and threat logs from your security rules</i> is yours to create and attach to every rule.</p>
<pre class="code"><span class="c"># Teaching format of a log forwarding profile</span>
Name:        corp-logs
Match list:  traffic-all   Log type: Traffic             Forward: Strata Logging Service
Match list:  threat-all    Log type: Threat Prevention   Forward: Strata Logging Service
Match list:  url-all       Log type: URL Filtering       Forward: Strata Logging Service
Match list:  wf-all        Log type: WildFire Submission Forward: Strata Logging Service</pre>

<h3>Rule order and the first-match principle</h3>
<p>Rules are read from the top. The <b>first rule that matches decides</b>; later rules are never consulted for that session. This is the most common cause of surprising policy behaviour.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Rule order">
<rect x="30" y="15" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="45" y="40" class="svg-ink" font-size="13">1  allow-private-hq-app  (specific)</text>
<rect x="30" y="65" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="45" y="90" class="svg-ink" font-size="13">2  allow-internet-web  (named apps)</text>
<rect x="30" y="115" width="300" height="40" rx="8" fill="#fed7aa"/><text x="45" y="140" class="svg-ink" font-size="13">3  deny-other-internal  (broad deny)</text>
<rect x="30" y="165" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="190" class="svg-ink" font-size="13">4  final deny and log</text>
<text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">Specific allows first</text>
<text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">then broader denies</text>
<text x="480" y="140" text-anchor="middle" class="svg-ink" font-size="13">Broad deny above</text>
<text x="480" y="162" text-anchor="middle" class="svg-muted" font-size="12">an allow = shadowed allow</text>
</svg><p class="cap">Put specific rules above general ones. A broad deny above a specific allow hides the allow.</p></div>

<h3>Shadowing</h3>
<p>A rule is <b>shadowed</b> when an earlier rule matches everything the later rule would match. The later rule shows zero hits however long you wait. Shadowing hides both mistakes (an allow that never works) and risks (a deny you think is active but never fires). To find it, review the hit counts and traffic logs: a rule with zero hits after weeks of traffic is either unneeded or shadowed. Remove or reorder it.</p>
<div class="eg"><p><b>Worked example.</b> An engineer adds <code>deny-other-internal</code> (destination zone trust, application any) and by mistake leaves it at position 1. The allow rule <code>allow-private-hq-app</code> at position 2 now gets zero hits, and users cannot open 10.10.0.50. The traffic log rule column shows <code>deny-other-internal</code> for every attempt. Moving the deny below the allow, then pushing, restores access while still denying 10.10.0.99.</p></div>
<pre class="out">Rule hits (last 7 days)
Pos  Rule                     Hits
1    deny-other-internal      <span class="hl">4,812</span>
2    allow-private-hq-app     <span class="hl">0</span>
3    allow-internet-web       91,330</pre>

<h3>Best practices for a rulebase</h3>
<ol>
<li><b>No any-to-any.</b> Use zones, named addresses and applications. The documentation says not to write any-to-any rules.</li>
<li><b>Allow by application, not by port.</b> Application-default for service.</li>
<li><b>Profile group on every allow rule.</b></li>
<li><b>Log at session end</b> and attach a log forwarding profile to every rule you care about, including the final deny.</li>
<li><b>Specific above general.</b> Keep a clearly named final deny.</li>
<li><b>Descriptive names and comments</b> so a stranger understands intent.</li>
<li><b>Review hit counts</b> on a schedule and delete rules nobody uses.</li>
<li><b>Change with approval:</b> small changes, a push, then verification in logs.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Forgetting a log forwarding profile on the rule, then having no evidence later; logging only at session start and missing the final application; leaving a temporary any rule in place; adding exception rules at the bottom where earlier broad rules already caught the traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> First match wins; there is no best match. And the log forwarding profile has to be attached to the rule; creating the profile alone sends nothing. Remember the log types: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering, Authentication.</p></div>

<div class="scn"><h4>Zero hits on a new rule</h4><p>A new allow rule for the HQ app showed zero hits for ten days while users complained. A teammate had inserted a "temporary" block rule for an internal subnet above it a week earlier, and it covered 10.10.0.0/24. The traffic log rule name column gave the answer in one minute. The block rule was narrowed and moved down, and the review checklist now requires removing temporary rules with a date.</p><p><b>Lesson:</b> hit counts are a health check for the rulebase itself.</p></div>

<div class="iv"><p class="q">"What is rule shadowing and how do you find it?"</p><p>An earlier rule matches all the traffic that a later rule was meant to match, so the later rule never fires. Find it with hit counts and traffic logs (zero hits is a flag), and fix it by narrowing, reordering or deleting. Mention first-match semantics and specific-above-general ordering.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A log forwarding profile (Objects, Log Forwarding) sends the logs; attach it to each rule.</li>
<li>First match wins; order from specific to general.</li>
<li>Shadowed rules show zero hits; review hit counts regularly.</li>
<li>No any-to-any; use zones, named addresses, applications and profile groups.</li>
<li>Panorama plugin pre-creates system, user-ID and HIP match log settings; traffic logging for your rules is yours to configure.</li>
</ul></div>
`,hi:`
<p>Dukaan mein security camera socho. Jo camera kuch record nahi karta wo sajawat hai. Jo camera sab record karta hai lekin footage galat building mein store hoti hai wo bhi lagbhag utna hi bura. Aur agar ek hi darwaze par do guards khade hain, aur pehla hamesha logon ko andar bhej deta hai, to doosre guard ko kaam karne ka mauka hi nahi milta. Ye chapter wo teen aadatein batata hai jo policy ko bharosemand banati hain: <b>logs jo pahunchte hain</b>, <b>sahi order mein rules</b>, aur <b>rules jo business allow kare utne narrow</b>.</p>

<h3>Log forwarding profiles</h3>
<p>Rule tabhi log entry likhta hai jab uski log setting kahe. <b>Log forwarding profile</b> system ko batata hai ki logs kahan jaayein. Product mein ye Objects, Log Forwarding ke andar hai. Profile mein log types ki match lists hoti hain: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering aur Authentication. Har match list forward method chunti hai: Panorama ko ya Strata Logging Service ko. Prisma Access ke saare logs Strata Logging Service mein pahunchte hain, chahe tenant kisi bhi tool se manage ho (operations module detail mein batata hai).</p>
<p>Panorama path par plugin templates mein log settings pehle se banata hai: jaise <code>Mobile_User_Template</code> mein <code>system-gpcs-default</code>, <code>userid-gpcs-default</code>, <code>hipmatch-gpcs-default</code> aur <code>gp-prismaaccess-default</code>. Ye system, user aur HIP logs sambhalte hain. <i>Aapke security rules ke traffic aur threat logs</i> ka log forwarding profile aapko khud banana aur har rule se attach karna hai.</p>
<pre class="code"><span class="c"># Log forwarding profile ka teaching format</span>
Name:        corp-logs
Match list:  traffic-all   Log type: Traffic             Forward: Strata Logging Service
Match list:  threat-all    Log type: Threat Prevention   Forward: Strata Logging Service
Match list:  url-all       Log type: URL Filtering       Forward: Strata Logging Service
Match list:  wf-all        Log type: WildFire Submission Forward: Strata Logging Service</pre>

<h3>Rule order aur first-match principle</h3>
<p>Rules upar se padhe jaate hain. <b>Pehla rule jo match kare wahi decide karta hai</b>; us session ke liye baad ke rules dekhe hi nahi jaate. Policy ke surprising behaviour ka sabse common reason yahi hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Rule order">
<rect x="30" y="15" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="45" y="40" class="svg-ink" font-size="13">1  allow-private-hq-app  (specific)</text>
<rect x="30" y="65" width="300" height="40" rx="8" fill="#bbf7d0"/><text x="45" y="90" class="svg-ink" font-size="13">2  allow-internet-web  (named apps)</text>
<rect x="30" y="115" width="300" height="40" rx="8" fill="#fed7aa"/><text x="45" y="140" class="svg-ink" font-size="13">3  deny-other-internal  (broad deny)</text>
<rect x="30" y="165" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="190" class="svg-ink" font-size="13">4  final deny and log</text>
<text x="480" y="40" text-anchor="middle" class="svg-ink" font-size="13">Pehle specific allows</text>
<text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">phir broader denies</text>
<text x="480" y="140" text-anchor="middle" class="svg-ink" font-size="13">Allow ke upar broad deny</text>
<text x="480" y="162" text-anchor="middle" class="svg-muted" font-size="12">= shadowed allow</text>
</svg><p class="cap">Specific rules general rules ke upar rakho. Specific allow ke upar broad deny allow ko chhupa deta hai.</p></div>

<h3>Shadowing</h3>
<p>Rule tab <b>shadowed</b> hota hai jab pehle ka rule wo sab match kar leta hai jo baad ka rule match karta. Baad wala rule kitna bhi wait karo, zero hits dikhata hai. Shadowing galtiyan (allow jo kabhi chalta nahi) aur risks (deny jo aap sochte ho active hai par kabhi fire nahi hota) dono chhupati hai. Dhundhne ke liye hit counts aur traffic logs dekho: hafton ke traffic ke baad bhi zero hits wala rule ya to zaroori nahi hai ya shadowed hai. Use hatao ya reorder karo.</p>
<div class="eg"><p><b>Worked example.</b> Ek engineer <code>deny-other-internal</code> (destination zone trust, application any) add karta hai aur galti se use position 1 par chhod deta hai. Position 2 ka <code>allow-private-hq-app</code> ab zero hits paata hai, aur users 10.10.0.50 nahi khol paate. Traffic log ka rule column har attempt ke liye <code>deny-other-internal</code> dikhata hai. Deny ko allow ke neeche le jaakar push karne se access wapas aata hai aur 10.10.0.99 phir bhi deny rehta hai.</p></div>
<pre class="out">Rule hits (last 7 days)
Pos  Rule                     Hits
1    deny-other-internal      <span class="hl">4,812</span>
2    allow-private-hq-app     <span class="hl">0</span>
3    allow-internet-web       91,330</pre>

<h3>Rulebase ke best practices</h3>
<ol>
<li><b>Any-to-any nahi.</b> Zones, named addresses aur applications use karo. Documentation kehti hai any-to-any rules mat likho.</li>
<li><b>Port nahi, application se allow.</b> Service ke liye application-default.</li>
<li><b>Har allow rule par profile group.</b></li>
<li><b>Session end par log</b> karo aur jis rule ki parwah hai (final deny sahit) usse log forwarding profile attach karo.</li>
<li><b>General ke upar specific.</b> Clearly named final deny rakho.</li>
<li><b>Descriptive names aur comments</b> taaki anjaan insaan intent samajh sake.</li>
<li><b>Hit counts ka review</b> schedule par karo aur jo rules koi use nahi karta unhe delete karo.</li>
<li><b>Approval ke saath change:</b> chhote changes, ek push, phir logs mein verification.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Rule par log forwarding profile bhool jana, aur baad mein evidence na hona; sirf session start par log karna aur final application miss karna; temporary any rule chhod dena; exception rules bottom mein add karna jahan pehle ke broad rules traffic pakad chuke hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> First match wins; "best match" nahi hota. Aur log forwarding profile rule se attach hona chahiye; sirf profile banane se kuch nahi bhejta. Log types yaad rakho: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering, Authentication.</p></div>

<div class="scn"><h4>Naye rule par zero hits</h4><p>HQ app ke naye allow rule ko das din zero hits mile jabki users shikayat kar rahe the. Ek teammate ne ek hafta pehle uske upar ek internal subnet ke liye "temporary" block rule daala tha, jo 10.10.0.0/24 cover karta tha. Traffic log ke rule name column ne ek minute mein jawab de diya. Block rule narrow karke neeche le jaya gaya, aur review checklist mein ab temporary rules ko date ke saath hatana zaroori hai.</p><p><b>Lesson:</b> hit counts rulebase ka khud ka health check hain.</p></div>

<div class="iv"><p class="q">"Rule shadowing kya hai aur kaise dhundhte ho?"</p><p>Pehla rule wo saara traffic match kar leta hai jo baad ke rule ko match karna tha, isliye baad wala rule kabhi fire nahi hota. Hit counts aur traffic logs se dhundho (zero hits flag hai), aur narrow, reorder ya delete karke fix karo. First-match semantics aur specific-above-general ordering ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log forwarding profile (Objects, Log Forwarding) logs bhejta hai; har rule se attach karo.</li>
<li>First match wins; specific se general order mein rakho.</li>
<li>Shadowed rules zero hits dikhate hain; hit counts ka regular review karo.</li>
<li>Any-to-any nahi; zones, named addresses, applications aur profile groups use karo.</li>
<li>Panorama plugin system, user-ID aur HIP match log settings pehle se banata hai; aapke rules ki traffic logging aapko configure karni hai.</li>
</ul></div>
`}};export{e as default};