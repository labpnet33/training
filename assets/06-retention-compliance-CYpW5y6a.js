var e={id:`retention-compliance`,h:{en:`Quota, retention and compliance thinking: what to keep for 30, 90 or 365 days`,hi:`Quota, retention aur compliance soch: 30, 90 ya 365 din kya rakhein`},body:{en:`
<p>A shopkeeper keeps the daily cash book on the counter for the month, the quarterly files in a cupboard for the tax officer, and old years' records in a godown because the law says so. He does not decide this by feeling; he asks "who will ask me for this, and how soon?" Log retention works the same way. The numbers 30, 90 and 365 are not magic. They come from the questions that people will ask later.</p>

<h3>Start from the questions, not from the disk</h3>
<table class="cmp"><tr><th>Who asks</th><th>Typical question</th><th>How far back</th><th>Where it should live</th></tr>
<tr><td>Network team</td><td>"Why was the branch slow last Tuesday?"</td><td>days to 30 days</td><td>Analytics (searchable)</td></tr>
<tr><td>Security team</td><td>"When did this address first appear?"</td><td>30 to 90 days</td><td>Analytics, then archive</td></tr>
<tr><td>Auditor or management</td><td>"Show every blocked P2P session of the year"</td><td>up to 365 days or more</td><td>Archive (evidence)</td></tr>
</table>
<p>The company's own policy or the rules of its sector set the longest period. This course gives no legal advice; ask your compliance owner for the number and write it down. Your job is to turn that number into settings.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Timeline of 30 days analytics and 150 days archive">
<rect x="20" y="50" width="130" height="50" rx="6" fill="#bbf7d0"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="13">Analytics 30 d</text>
<rect x="150" y="50" width="400" height="50" rx="6" fill="#fde68a"/><text x="350" y="80" text-anchor="middle" class="svg-ink" font-size="13">Archive: days 31 to 180 (150 d)</text>
<rect x="550" y="50" width="70" height="50" rx="6" fill="#fed7aa"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="13">Deleted</text>
<text x="20" y="130" class="svg-muted" font-size="12">today</text><text x="140" y="130" class="svg-muted" font-size="12">day 30</text><text x="530" y="130" class="svg-muted" font-size="12">day 180</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">Kaveri audit policy: analytics-retention 30, archive-retention 180</text>
</svg><p class="cap">A log's age decides its area. The archive value counts from the log's own age, not from the day it moved.</p></div>

<h3>Turning a policy into settings</h3>
<p>Kaveri Retail's audit policy for the ADOM Kaveri says: 30 days searchable, 180 days in total, quota 500 MB, oldest logs overwritten when full. In the lab these four requirements become four lines:</p>
<pre class="code">config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end</pre>
<p>The overwrite policy is the default, so <code>show system log settings</code> prints an empty block when you have not changed it. Proof that the values are in place and that the storage page uses them:</p>
<pre class="out">FAZ-1 # show system log quota
config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end
FAZ-1 # execute fazui storage Kaveri
  Disk quota          : <span class="hl">500 MB</span>
  When the quota is full: overwrite the oldest logs
  Retention           : <span class="hl">analytics 30 days, archive 180 days</span>
  Logs stored         : analytics 8 (traffic 8, utm 0, event 0), archive 0</pre>

<h3>Three checks before you promise a number</h3>
<ol>
<li><b>Does the disk really hold it?</b> Multiply logs per day by average size by days (chapter 4). If the quota is smaller than that, the promised retention is fiction: overwrite will delete history early, and drop will refuse new logs.</li>
<li><b>Is the clock consistent?</b> Archive retention is never less than analytics retention. A policy of "30 searchable, 20 total" cannot be built.</li>
<li><b>Who watches?</b> Somebody must read the Overwritten and Rejected counters regularly, or the quota hides problems. Put it in a weekly checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Head office asks for 90 days of searchable logs for Corporate, the stores need 30. Because the two audiences have different retention, they are in different ADOMs (chapter 3). Corporate gets <code>analytics-retention 90</code> and a larger quota; Retail keeps 30 and a smaller one. If both were in one ADOM, you would have to give the stores 90 days as well, and pay for the disk.</p></div>

<h3>Overwrite or drop: a compliance view</h3>
<p>If the rule is "never lose evidence", drop looks safer, but then new logs are refused and the live picture is lost, which is dangerous during an attack. If the rule is "always see what is happening now", overwrite is the choice. Most teams choose overwrite and prevent the problem with a larger disk and an alert at about 70 percent. Whatever you choose, document it and the reason.</p>

<h3>Theory: forwarding, aggregation and HA</h3>
<p>These topics are not modelled in the simulator, so treat them as vocabulary. In the real product a FortiAnalyzer can <b>forward</b> logs to another FortiAnalyzer or to an external system, for example a central collection point or a SIEM. It can also work in <b>collector mode</b> (receive and store, light analysis) or <b>analyzer mode</b> (full analysis and reports), and two units can be placed in an <b>HA cluster</b> so that logs survive the loss of one unit. Each of these protects or copies logs; none of them replaces a sensible retention policy.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Promising 365 days on a disk that holds 90. (2) Setting the same long retention for everyone because "it is safer", then running out of disk. (3) Treating HA as a backup of history; HA keeps the service up, it is not an archive plan. (4) Changing retention without telling the team that depends on the old value.</p></div>

<div class="exam"><p><b>Exam traps.</b> Retention values are per ADOM and in days. The archive keeps logs for evidence but they are not searchable. A quota is a size, retention is time; they interact but one does not replace the other.</p></div>

<div class="scn"><h4>Ninety days promised, forty delivered</h4><p>A services company told its customer "we keep 90 days of firewall logs". The ADOM was set to 90 days, but the quota allowed only about 40 days of traffic. The quota policy was overwrite, so each day the oldest day vanished quietly. During a dispute at day 70 the evidence did not exist. The engineer later wrote a one-page sizing note, enlarged the disk, and added the Overwritten counter to the monthly report.</p><p><b>Lesson:</b> a retention number is only true when the quota and the disk can carry it.</p></div>

<div class="iv"><p class="q">"How do you decide how long to keep logs?"</p><p>I start from who will ask for the logs and how far back, add the compliance owner's number, then size quota and disk for it and map it to analytics and archive days per ADOM. I choose overwrite or drop deliberately, and I monitor the Overwritten and Rejected counters. I mention forwarding and HA as separate protections, not as retention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Turn the audience's questions into days, then days into settings per ADOM.</li>
<li>Typical shape: 30 days searchable, longer archive for evidence.</li>
<li>A retention number is only true if quota and disk can carry it.</li>
<li>Watch Overwritten and Rejected, not only the percentage used.</li>
<li>Forwarding, collector and analyzer modes and HA are theory here and do not replace retention.</li>
</ul></div>
`,hi:`
<p>Ek dukandar daily cash book mahine bhar counter par rakhta hai, quarterly files almari mein tax officer ke liye, aur purane saalon ke records godown mein kyunki kanoon kehta hai. Wo ye andaze se tay nahi karta; wo poochhta hai "ye mujhse kaun maangega, aur kitni jaldi?" Log retention bhi aise hi kaam karti hai. 30, 90 aur 365 koi jaadu ke numbers nahi hain. Ye un sawaalon se aate hain jo log baad mein poochhenge.</p>

<h3>Disk se nahi, sawaalon se shuru karo</h3>
<table class="cmp"><tr><th>Kaun poochhta hai</th><th>Aam sawaal</th><th>Kitna peeche</th><th>Kahan rehna chahiye</th></tr>
<tr><td>Network team</td><td>"Pichhle Tuesday branch slow kyun thi?"</td><td>din se 30 din</td><td>Analytics (searchable)</td></tr>
<tr><td>Security team</td><td>"Ye address pehli baar kab aaya?"</td><td>30 se 90 din</td><td>Analytics, phir archive</td></tr>
<tr><td>Auditor ya management</td><td>"Saal ke har blocked P2P session dikhao"</td><td>365 din ya zyada tak</td><td>Archive (evidence)</td></tr>
</table>
<p>Sabse lambi period company ki apni policy ya sector ke rules tay karte hain. Ye course legal advice nahi deta; number ke liye compliance owner se poochho aur likh lo. Aapka kaam us number ko settings mein badalna hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="30 din analytics aur 150 din archive ki timeline">
<rect x="20" y="50" width="130" height="50" rx="6" fill="#bbf7d0"/><text x="85" y="80" text-anchor="middle" class="svg-ink" font-size="13">Analytics 30 d</text>
<rect x="150" y="50" width="400" height="50" rx="6" fill="#fde68a"/><text x="350" y="80" text-anchor="middle" class="svg-ink" font-size="13">Archive: din 31 se 180 (150 d)</text>
<rect x="550" y="50" width="70" height="50" rx="6" fill="#fed7aa"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="13">Deleted</text>
<text x="20" y="130" class="svg-muted" font-size="12">aaj</text><text x="140" y="130" class="svg-muted" font-size="12">din 30</text><text x="530" y="130" class="svg-muted" font-size="12">din 180</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">Kaveri audit policy: analytics-retention 30, archive-retention 180</text>
</svg><p class="cap">Log ki umar uska area tay karti hai. Archive value log ki apni umar se gini jati hai, move hone ke din se nahi.</p></div>

<h3>Policy ko settings mein badalna</h3>
<p>Kaveri Retail ki ADOM Kaveri ke liye audit policy kehti hai: 30 din searchable, kul 180 din, quota 500 MB, full hone par sabse purane logs overwrite. Lab mein ye chaar requirements chaar lines ban jati hain:</p>
<pre class="code">config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end</pre>
<p>Overwrite policy default hai, isliye aapne use nahi badla to <code>show system log settings</code> khaali block print karta hai. Saboot ki values lagi hain aur storage page unhe use karta hai:</p>
<pre class="out">FAZ-1 # show system log quota
config system log quota
    edit "Kaveri"
        set quota-mb 500
        set analytics-retention 30
        set archive-retention 180
    next
end
FAZ-1 # execute fazui storage Kaveri
  Disk quota          : <span class="hl">500 MB</span>
  When the quota is full: overwrite the oldest logs
  Retention           : <span class="hl">analytics 30 days, archive 180 days</span>
  Logs stored         : analytics 8 (traffic 8, utm 0, event 0), archive 0</pre>

<h3>Number promise karne se pehle teen checks</h3>
<ol>
<li><b>Kya disk sach mein itna rakh sakti hai?</b> Logs per day x average size x days (chapter 4). Quota isse chhota hai to promised retention kalpana hai: overwrite history jaldi delete karega, aur drop naye logs refuse karega.</li>
<li><b>Kya clock consistent hai?</b> Archive retention analytics retention se kam kabhi nahi hoti. "30 searchable, 20 total" wali policy bana hi nahi sakte.</li>
<li><b>Kaun dekhta hai?</b> Kisi ko Overwritten aur Rejected counters regularly padhne chahiye, warna quota problems chhupa leta hai. Ise weekly checklist mein daalo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Head office Corporate ke liye 90 din searchable logs maangta hai, stores ko 30 chahiye. Dono audiences ki retention alag hai, isliye wo alag ADOMs mein hain (chapter 3). Corporate ko <code>analytics-retention 90</code> aur bada quota milta hai; Retail 30 aur chhota quota rakhta hai. Dono ek ADOM mein hote to stores ko bhi 90 din dene padte, aur disk ka kharcha bhi.</p></div>

<h3>Overwrite ya drop: compliance ki nazar se</h3>
<p>Rule "evidence kabhi mat khoo" ho to drop zyada safe lagta hai, par tab naye logs refuse hote hain aur live picture kho jata hai, jo attack ke dauran khatarnak hai. Rule "abhi kya ho raha hai wo hamesha dikhe" ho to overwrite chuno. Zyadatar teams overwrite chunti hain aur bade disk aur lagbhag 70 percent par alert se problem rokti hain. Jo bhi chuno, use aur wajah ko document karo.</p>

<h3>Theory: forwarding, aggregation aur HA</h3>
<p>Ye topics simulator mein model nahi hain, to inhe vocabulary samjho. Real product mein FortiAnalyzer logs ko doosre FortiAnalyzer ya external system ko <b>forward</b> kar sakta hai, jaise central collection point ya SIEM. Wo <b>collector mode</b> (receive aur store, halka analysis) ya <b>analyzer mode</b> (poora analysis aur reports) mein bhi kaam kar sakta hai, aur do units <b>HA cluster</b> mein rakhi ja sakti hain taaki ek unit jaane par bhi logs bachein. Inme se har ek logs ko protect ya copy karta hai; koi bhi sahi retention policy ki jagah nahi leta.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) 90 din ki disk par 365 din ka vaada. (2) "Safe rahega" soch kar sabke liye same lambi retention, phir disk khatam. (3) HA ko history ka backup samajhna; HA service up rakhta hai, wo archive plan nahi hai. (4) Retention badalna bina us team ko batayein jo purani value par depend karti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Retention values per ADOM aur din mein hoti hain. Archive evidence ke liye logs rakhta hai par wo searchable nahi hote. Quota size hai, retention time hai; dono ek doosre se judte hain par ek doosre ki jagah nahi lete.</p></div>

<div class="scn"><h4>Vaada 90 din, delivery 40 din</h4><p>Ek services company ne customer se kaha "hum firewall logs ke 90 din rakhte hain". ADOM 90 din par set tha, par quota sirf lagbhag 40 din ka traffic rakh sakta tha. Quota policy overwrite thi, to har din sabse purana din chupchap gayab hota gaya. Din 70 par dispute mein evidence exist hi nahi karta tha. Engineer ne baad mein ek page ka sizing note likha, disk badhayi, aur Overwritten counter ko monthly report mein jodha.</p><p><b>Lesson:</b> retention number tabhi sach hai jab quota aur disk use utha sakein.</p></div>

<div class="iv"><p class="q">"Logs kitne din rakhne hain ye kaise tay karte ho?"</p><p>Main shuru karta hoon ki logs kaun maangega aur kitna peeche, compliance owner ka number jodta hoon, phir uske liye quota aur disk size karta hoon aur use per ADOM analytics aur archive days mein map karta hoon. Overwrite ya drop soch-samajh kar chunta hoon, aur Overwritten aur Rejected counters monitor karta hoon. Forwarding aur HA ko alag protection batata hoon, retention nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Audience ke sawaalon ko days mein, phir days ko per ADOM settings mein badlo.</li>
<li>Typical shape: 30 din searchable, evidence ke liye lamba archive.</li>
<li>Retention number tabhi sach hai jab quota aur disk use utha sakein.</li>
<li>Sirf percentage used nahi, Overwritten aur Rejected bhi dekho.</li>
<li>Forwarding, collector aur analyzer modes aur HA yahan theory hain aur retention ki jagah nahi lete.</li>
</ul></div>
`}};export{e as default};