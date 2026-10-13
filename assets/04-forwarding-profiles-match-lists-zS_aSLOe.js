var e={id:`forwarding-profiles-match-lists`,h:{en:`Log forwarding profiles, match lists and filters`,hi:`Log forwarding profiles, match lists aur filters`},body:{en:`
<p>A log forwarding profile is a sorting table at a post office. Each parcel is checked against a list of rules: "if it is a letter to the city, put it in bag A; if it is heavy, put it in bag B". A parcel can match more than one line and be copied into several bags. The profile does exactly this for logs: it reads each log, checks the lines in order, and sends the matching ones to the destinations you named.</p>

<h3>The parts of a profile</h3>
<table class="tbl"><tr><th>Part</th><th>Meaning</th><th>Example in the lab</th></tr>
<tr><td>Profile</td><td>A named container that rules attach to</td><td>LFP</td></tr>
<tr><td>Match list</td><td>One line of the sorting table; a profile can have several</td><td>ALL, DENY</td></tr>
<tr><td>Log type</td><td>Which kind of log this line looks at</td><td>traffic</td></tr>
<tr><td>Filter</td><td>A condition on the log; the line fires only when it is true</td><td>"All Logs" or "(action eq deny)"</td></tr>
<tr><td>Destinations</td><td>Where matching logs go</td><td>send-to-panorama yes, send-syslog NK-SYSLOG</td></tr>
</table>

<h3>Filters, from simple to specific</h3>
<p>The simplest filter is <code>"All Logs"</code>: every log of that type matches. Anything narrower is an expression in brackets. The lab understands these:</p>
<table class="tbl"><tr><th>Filter</th><th>Selects</th></tr>
<tr><td>"All Logs"</td><td>every log of the type</td></tr>
<tr><td>(action eq deny)</td><td>only denied sessions</td></tr>
<tr><td>(rule eq Allow-Out)</td><td>only sessions matched by the named rule</td></tr>
<tr><td>(app eq web-browsing)</td><td>only the named application</td></tr>
<tr><td>(addr.src in 10.1.0.0/16)</td><td>only sessions from that source range</td></tr>
</table>
<p>Expressions can be joined with <code>and</code> and <code>or</code>, for example denied sessions from one source range. Spell field names exactly: a filter that matches nothing is not an error, it just selects nothing. That is another quiet failure.</p>

<h3>One profile, several lines</h3>
<p>Match lists are independent. A log that matches two lines goes to the destinations of both. So a profile can have an <b>ALL</b> line sending everything to Panorama and a <b>DENY</b> line sending only denies to a syslog server. The denied log matches both lines and goes to both places. That is the core idea of the third lab.</p>
<pre class="code">set shared log-settings profiles LFP match-list ALL log-type traffic filter "All Logs" send-to-panorama yes
set shared log-settings profiles LFP match-list DENY log-type traffic filter "(action eq deny)" send-syslog NK-SYSLOG</pre>
<p>Notice that the profile lives under <b>shared</b> log settings, so any device group can use it. Syslog destinations are named server profiles, which come from a template; the next chapter explains why.</p>

<h3>Reading the profile on Panorama</h3>
<p>When you check a profile in the lab, look for four things on each match list: the log type, the filter text, whether <code>send-to-panorama</code> is yes or no, and the syslog profile name. A match list with <code>send-to-panorama no</code> is perfectly valid. It simply does nothing for Panorama. This is a very common cause of an empty Panorama.</p>

<div class="warn"><p><b>Common mistakes.</b> send-to-panorama left at no; a filter with a typo; a profile that exists but is not named on any rule; assuming a profile applies to every rule automatically.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match lists do not stop at the first match. A log can match several lines and be sent to several destinations.</p></div>

<div class="scn"><h4>The filter that was too clever</h4><p>A team wanted only sessions from the sales network on Panorama and wrote a filter on the source range. Months later a new branch got a different address range. Nothing errored, and the new branch simply never appeared in Panorama. Later they changed the profile to an ALL line for Panorama and used narrower filters only for the external system.</p><p><b>Lesson:</b> keep the central copy broad; narrow filters are for secondary destinations.</p></div>

<div class="iv"><p class="q">"How can one profile send all logs to Panorama and only denies to a SIEM?"</p><p>Use two match lists in the same profile. One has the All Logs filter with send-to-panorama set to yes; the other has a filter such as action equals deny with a syslog server profile as its destination. A denied log matches both lines and goes to both; an allowed log matches only the first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A profile holds match lists; each list has a log type, a filter and destinations.</li>
<li>Filters range from All Logs to expressions on action, rule, app and address.</li>
<li>A log can match several lists and go to several destinations.</li>
<li>send-to-panorama no and mistyped filters fail silently.</li>
</ul></div>
`,hi:`
<p>Log forwarding profile post office ki sorting table jaisa hai. Har parcel ko rules ki list se check kiya jata hai: "city ka letter ho to bag A mein; bhaari ho to bag B mein". Ek parcel ek se zyada line se match ho sakta hai aur kai bags mein copy ho sakta hai. Profile logs ke saath yahi karta hai: har log padhta hai, lines ko order mein check karta hai, aur matching logs ko aapke diye destinations par bhejta hai.</p>

<h3>Profile ke hisse</h3>
<table class="tbl"><tr><th>Hissa</th><th>Matlab</th><th>Lab mein example</th></tr>
<tr><td>Profile</td><td>Naam wala container jisse rules attach hote hain</td><td>LFP</td></tr>
<tr><td>Match list</td><td>Sorting table ki ek line; profile mein kai ho sakti hain</td><td>ALL, DENY</td></tr>
<tr><td>Log type</td><td>Ye line kaunsa log dekhti hai</td><td>traffic</td></tr>
<tr><td>Filter</td><td>Log par condition; line tabhi chalti hai jab true ho</td><td>"All Logs" ya "(action eq deny)"</td></tr>
<tr><td>Destinations</td><td>Matching logs kahan jayenge</td><td>send-to-panorama yes, send-syslog NK-SYSLOG</td></tr>
</table>

<h3>Filters, simple se specific tak</h3>
<p>Sabse simple filter <code>"All Logs"</code> hai: us type ka har log match karta hai. Isse narrow kuch bhi bracket wala expression hai. Lab ye samajhta hai:</p>
<table class="tbl"><tr><th>Filter</th><th>Kya select karta hai</th></tr>
<tr><td>"All Logs"</td><td>us type ka har log</td></tr>
<tr><td>(action eq deny)</td><td>sirf denied sessions</td></tr>
<tr><td>(rule eq Allow-Out)</td><td>sirf us rule se matched sessions</td></tr>
<tr><td>(app eq web-browsing)</td><td>sirf us application ke</td></tr>
<tr><td>(addr.src in 10.1.0.0/16)</td><td>sirf us source range ke sessions</td></tr>
</table>
<p>Expressions ko <code>and</code> aur <code>or</code> se jod sakte ho, jaise ek source range ke denied sessions. Field names bilkul sahi likho: jo filter kisi se match nahi karta wo error nahi deta, bas kuch select nahi karta. Ye bhi ek chupchaap failure hai.</p>

<h3>Ek profile, kai lines</h3>
<p>Match lists independent hoti hain. Jo log do lines se match kare wo dono ke destinations par jata hai. To profile mein ek <b>ALL</b> line sab kuch Panorama ko bhej sakti hai aur ek <b>DENY</b> line sirf denies syslog server ko. Denied log dono lines se match karta hai aur dono jagah jata hai. Teesre lab ka core idea yahi hai.</p>
<pre class="code">set shared log-settings profiles LFP match-list ALL log-type traffic filter "All Logs" send-to-panorama yes
set shared log-settings profiles LFP match-list DENY log-type traffic filter "(action eq deny)" send-syslog NK-SYSLOG</pre>
<p>Dhyan do ki profile <b>shared</b> log settings ke neeche hai, isliye koi bhi device group use kar sakta hai. Syslog destinations naam wale server profiles hain, jo template se aate hain; agla chapter batata hai kyun.</p>

<h3>Panorama par profile padhna</h3>
<p>Lab mein profile check karte waqt har match list par chaar cheezein dekho: log type, filter text, <code>send-to-panorama</code> yes hai ya no, aur syslog profile ka naam. <code>send-to-panorama no</code> wali match list bilkul valid hai. Wo Panorama ke liye bas kuch nahi karti. Khaali Panorama ka ye bahut common reason hai.</p>

<div class="warn"><p><b>Common mistakes.</b> send-to-panorama no chhod dena; filter mein typo; profile ban gaya lekin kisi rule par naam nahi; ye maan lena ki profile har rule par apne aap lagta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match lists pehle match par ruk'ti nahi. Ek log kai lines se match hokar kai destinations par ja sakta hai.</p></div>

<div class="scn"><h4>Jo filter zyada hoshiyar tha</h4><p>Ek team ko sirf sales network ke sessions Panorama par chahiye the, unhone source range par filter likha. Mahino baad naye branch ko alag address range mila. Koi error nahi aaya, naya branch Panorama mein kabhi dikha hi nahi. Baad mein unhone Panorama ke liye ALL line rakhi aur narrow filters sirf external system ke liye.</p><p><b>Lesson:</b> central copy broad rakho; narrow filters secondary destinations ke liye hain.</p></div>

<div class="iv"><p class="q">"Ek profile sab logs Panorama ko aur sirf denies SIEM ko kaise bhej sakta hai?"</p><p>Ek hi profile mein do match lists. Ek mein All Logs filter aur send-to-panorama yes; doosri mein action equals deny jaisa filter aur destination ke taur par syslog server profile. Denied log dono lines se match karke dono jagah jata hai; allowed log sirf pehli se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profile mein match lists hoti hain; har list ka log type, filter aur destinations hote hain.</li>
<li>Filters All Logs se lekar action, rule, app aur address ke expressions tak hote hain.</li>
<li>Ek log kai lists se match hokar kai destinations par ja sakta hai.</li>
<li>send-to-panorama no aur mistyped filters chupchaap fail hote hain.</li>
</ul></div>
`}};export{e as default};