var e={id:`why-experience`,h:{en:`Why experience monitoring exists`,hi:`Experience monitoring kyun exist karti hai`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you learn what digital experience monitoring is, how a user's experience becomes one score, how to read the five hops between a laptop and an application, and how to find the slow hop with evidence instead of guesses. <b>Prerequisites:</b> the forwarding module (so you know the path a request takes) and basic ideas of latency and packet loss. In the vendor's own wording the three services of this family are called ZIA, ZPA and ZDX; here we say internet access policy, private access and digital experience.</p>

<h3>The classic complaint</h3>
<p>Kabir in Jaipur calls the help desk: "CRM is slow". The network team looks at the router: up. The security team looks at the policy: allowed. The application team looks at the server: healthy. Everyone shows green and the user is still unhappy. The problem is that each team watches its own box, but the user lives on the <b>whole path</b>. Experience monitoring measures that path from the user's side and tells you where the time is going.</p>

<h3>The doctor analogy</h3>
<p>A good doctor does not only ask "are you ill?". She takes temperature, pulse and blood pressure, compares them with normal values and says which one is off. Digital experience monitoring does the same: it measures small vital signs at every hop, compares each with a normal value (the <b>baseline</b>), and names the hop that is furthest from normal.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Path from device to application">
<rect x="10" y="50" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="85" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="135" y="50" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="185" y="85" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi</text>
<rect x="260" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="78" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="13">circuit</text>
<rect x="395" y="50" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="445" y="85" text-anchor="middle" class="svg-ink" font-size="13">Cloud path</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">five hops; any one can be the slow one</text>
</svg><p class="cap">The user's experience is the sum of five hops.</p></div>

<h3>What a score means</h3>
<p>The portal turns the measurements into one number per user and application and sorts it into a bucket: <b>Good</b> (66 or more), <b>Okay</b> (34 to 65) and <b>Poor</b> (below 34). Buckets are for humans; they let a manager see "three people are Poor" without reading numbers. The score is a summary. The useful part is the <b>cause</b>, the hop that drags the score.</p>

<h3>Where monitoring fits in the track</h3>
<ul>
<li>Forwarding decides the path; policy decides allow or block; <b>experience</b> tells you how good the allowed path feels.</li>
<li>An allowed request can still be unusable. Monitoring catches the "allowed but awful" case that policy tools never see.</li>
<li>Scores also help prove a problem is <i>not</i> yours. If every hop is healthy, the issue is outside your control and you can say so with data.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Sales in Jaipur and Finance in Pune both use the CRM. Pune scores Good, Jaipur Poor. Same application, same policy. So the difference is in the Jaipur hops: that single comparison already narrows the search.</p></div>
<pre class="out">Digital experience &gt; Overview   app: CRM
User     Site     Score   Bucket
ravi     Pune     82      Good
meena    Chennai  71      Good
kabir    Jaipur   <span class="hl">24</span>      <span class="hl">Poor</span></pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Turning digital experience on does not change any rule or path. It adds small test traffic (probes) from the device toward chosen applications and records the results. It observes; it never allows or blocks anything. Because probes are extra traffic, exact intervals and sizes come from the vendor documentation.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating a Poor score as proof that security policy is the cause. (2) Reading only the score and ignoring the cause line. (3) Expecting scores for an application that has no probe.</p></div>
<div class="exam"><p><b>Exam trap.</b> Monitoring is passive for policy: it never blocks. "Which feature would stop a bad site?" is URL filtering, not experience monitoring.</p></div>

<div class="scn"><h4>Everyone green, user unhappy</h4><p>A branch complained for a week while dashboards were green. When experience monitoring was enabled, the Poor scores showed a pattern: only that branch, only in the afternoon. The cause line pointed to the Internet circuit.</p><p><b>Lesson:</b> measure from the user side and compare against a baseline.</p></div>

<div class="iv"><p class="q">"Why do you need user-side monitoring when you already monitor devices?"</p><p>Device monitoring says each box is up; it cannot say how the end-to-end path feels. User-side probes score the real path, split it into hops, and point at the weakest one. Mention baselines and that it proves what is not the fault too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Experience is the whole path, not one device.</li>
<li>Five hops: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>Buckets: Good 66 or more, Okay 34 to 65, Poor below 34.</li>
<li>The cause is the hop furthest above its baseline.</li>
<li>Monitoring observes; it never changes policy.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Is module mein aap seekhoge ki digital experience monitoring kya hai, user ka experience ek score kaise banta hai, laptop aur application ke beech ke paanch hops kaise padhte hain, aur guess ki jagah evidence se slow hop kaise dhundhte hain. <b>Prerequisites:</b> forwarding module (taaki request ka path pata ho) aur latency aur packet loss ke basic ideas. Vendor ke apne wording mein is family ki teen services ZIA, ZPA aur ZDX kehlati hain; yahan hum internet access policy, private access aur digital experience bolte hain.</p>

<h3>Classic complaint</h3>
<p>Jaipur ka Kabir help desk ko call karta hai: "CRM slow hai". Network team router dekhti hai: up. Security team policy dekhti hai: allowed. Application team server dekhti hai: healthy. Sab green dikhate hain aur user phir bhi naakhush hai. Problem yeh hai ki har team apna box dekhti hai, lekin user <b>poore path</b> par rehta hai. Experience monitoring us path ko user ki taraf se measure karti hai aur batati hai ki time kahan ja raha hai.</p>

<h3>Doctor ka analogy</h3>
<p>Achha doctor sirf "kya aap bimar ho?" nahi poochta. Woh temperature, pulse aur blood pressure leta hai, normal values se compare karta hai aur batata hai kaun sa off hai. Digital experience monitoring bhi yahi karti hai: har hop par chhote vital signs measure karti hai, har ek ko normal value (<b>baseline</b>) se compare karti hai, aur us hop ka naam batati hai jo normal se sabse door hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Device se application tak path">
<rect x="10" y="50" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="85" text-anchor="middle" class="svg-ink" font-size="13">Device</text>
<rect x="135" y="50" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="185" y="85" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi</text>
<rect x="260" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="78" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="13">circuit</text>
<rect x="395" y="50" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="445" y="85" text-anchor="middle" class="svg-ink" font-size="13">Cloud path</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="575" y="85" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="495" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">paanch hops; koi bhi ek slow ho sakta hai</text>
</svg><p class="cap">User ka experience paanch hops ka total hai.</p></div>

<h3>Score ka matlab</h3>
<p>Portal measurements ko har user aur application ke liye ek number mein badalta hai aur bucket mein daalta hai: <b>Good</b> (66 ya zyada), <b>Okay</b> (34 se 65) aur <b>Poor</b> (34 se kam). Buckets insaano ke liye hain; manager numbers padhe bina dekh leta hai "teen log Poor hain". Score ek summary hai. Kaam ki cheez <b>cause</b> hai, woh hop jo score ko neeche kheench raha hai.</p>

<h3>Track mein monitoring ki jagah</h3>
<ul>
<li>Forwarding path decide karta hai; policy allow ya block decide karti hai; <b>experience</b> batata hai ki allowed path kaisa feel hota hai.</li>
<li>Allowed request bhi unusable ho sakti hai. Monitoring "allowed lekin kharab" case pakadti hai jo policy tools kabhi nahi dekhte.</li>
<li>Scores yeh prove karne mein bhi madad karte hain ki problem aapki <i>nahi</i> hai. Har hop healthy ho to issue aapke control ke bahar hai aur aap data se keh sakte ho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Jaipur ki Sales aur Pune ki Finance dono CRM use karte hain. Pune Good score karta hai, Jaipur Poor. Same application, same policy. To farak Jaipur ke hops mein hai: sirf yeh ek comparison search ko chhota kar deta hai.</p></div>
<pre class="out">Digital experience &gt; Overview   app: CRM
User     Site     Score   Bucket
ravi     Pune     82      Good
meena    Chennai  71      Good
kabir    Jaipur   <span class="hl">24</span>      <span class="hl">Poor</span></pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Digital experience on karne se koi rule ya path nahi badalta. Yeh device se chune hue applications ki taraf chhota test traffic (probes) jodta hai aur results record karta hai. Yeh observe karta hai; kabhi kuch allow ya block nahi karta. Probes extra traffic hain, isliye exact intervals aur sizes vendor documentation se aate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Poor score ko security policy ka proof maan lena. (2) Sirf score padhna aur cause line ignore karna. (3) Aise application ke liye score expect karna jiska probe hi nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Monitoring policy ke liye passive hai: yeh kabhi block nahi karti. "Kaun sa feature kharab site rokega?" URL filtering hai, experience monitoring nahi.</p></div>

<div class="scn"><h4>Sab green, user naakhush</h4><p>Ek branch ek hafte tak complain karti rahi jabki dashboards green the. Experience monitoring on hui to Poor scores ka pattern dikha: sirf wahi branch, sirf dopahar mein. Cause line ne Internet circuit ki taraf ishara kiya.</p><p><b>Seekh:</b> user ki taraf se measure karo aur baseline se compare karo.</p></div>

<div class="iv"><p class="q">"Jab devices monitor ho rahe hain to user-side monitoring kyun chahiye?"</p><p>Device monitoring batati hai har box up hai; yeh nahi bata sakti ki end-to-end path kaisa feel hota hai. User-side probes asli path ko score karte hain, hops mein todte hain, aur sabse kamzor hop dikhate hain. Baselines mention karo aur yeh bhi ki yeh prove karta hai ki fault kahan nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Experience poora path hai, ek device nahi.</li>
<li>Paanch hops: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>Buckets: Good 66 ya zyada, Okay 34 se 65, Poor 34 se kam.</li>
<li>Cause woh hop hai jo apni baseline se sabse upar hai.</li>
<li>Monitoring observe karti hai; policy kabhi nahi badalti.</li>
</ul></div>
`}};export{e as default};