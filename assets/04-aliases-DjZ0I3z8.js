var e={id:`aliases`,h:{en:`Aliases: one rule, a different value per engine`,hi:`Aliases: ek rule, har engine ke liye alag value`},body:{en:`
<p>MyPnetLab does not have one branch. It has Pune, HQ and more to come. If every branch needs the same policy, but the Staff network is 10.1.1.0/24 in Pune and something else elsewhere, how do you write one rule? The answer is an <b>alias</b>.</p>

<h3>Analogy: the word "home"</h3>
<p>If you tell a taxi driver "take me home", the same sentence works for every passenger, and every passenger ends up at a different address. The word <i>home</i> is an alias: a name whose meaning depends on who is asking. In the SMC an alias is an element whose <b>value is chosen per engine</b>, when the policy is installed on that engine. One rule can say "allow the local staff network to reach the internet" and each engine fills in its own staff network.</p>

<h3>How an alias works</h3>
<ol>
<li>You create the alias with a name, for example <code>alias-local-staff</code>.</li>
<li>For each engine that will use it, you give the alias a <b>value</b>, which is another element, such as a network element.</li>
<li>You use the alias in policy rules like any other element.</li>
<li>At install time the SMC resolves the alias for the target engine and compiles the real addresses into that engine configuration.</li>
</ol>
<p>The resolution happens during Install policy, per engine. The policy itself still holds the alias name. The engine never sees the alias, only the resolved result.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="One alias resolved for two engines">
<rect x="230" y="15" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Rule: allow alias-local-staff</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">to the internet</text>
<rect x="30" y="110" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="140" y="135" text-anchor="middle" class="svg-ink" font-size="13">Install on NK-PUNE-FW</text><text x="140" y="153" text-anchor="middle" class="svg-muted" font-size="12">alias = net-staff 10.1.1.0/24</text>
<rect x="390" y="110" width="220" height="60" rx="10" fill="#fde68a"/><text x="500" y="135" text-anchor="middle" class="svg-ink" font-size="13">Install on NK-HQ-FW</text><text x="500" y="153" text-anchor="middle" class="svg-muted" font-size="12">alias = HQ LAN network</text>
<line x1="290" y1="65" x2="170" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="65" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="195" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="140" y="220" text-anchor="middle" class="svg-ink" font-size="12">compiled with 10.1.1.0/24</text>
<rect x="390" y="195" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="500" y="220" text-anchor="middle" class="svg-ink" font-size="12">compiled with the HQ network</text>
<line x1="140" y1="170" x2="140" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="170" x2="500" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The rule is written once. The value is filled in per engine at install time.</p></div>

<h3>Why aliases matter</h3>
<ul>
<li><b>Fewer policies.</b> One shared template policy can serve many branches.</li>
<li><b>Fewer mistakes.</b> You do not copy a rule ten times and change one address in each copy.</li>
<li><b>Safe changes.</b> When a branch is renumbered, you change the alias value for that engine, not the rule.</li>
</ul>
<p>The policy template idea belongs to the next module. For now, focus on the alias itself and what can go wrong.</p>

<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Where is the value defined?</td><td>In the alias element, one value per engine</td></tr>
<tr><td>When is it resolved?</td><td>During Install policy, for the target engine</td></tr>
<tr><td>What if an engine has no value?</td><td>Validation error: the install is blocked</td></tr>
<tr><td>Does the engine know the alias name?</td><td>No. It receives resolved addresses</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The alias <code>alias-local-staff</code> has two values: for NK-PUNE-FW it is the network element <code>net-staff</code> (10.1.1.0/24); for NK-HQ-FW it is an HQ LAN network element. The policy contains the rule "alias-local-staff &rarr; any, HTTPS, allow". Installing on Pune compiles to source 10.1.1.0/24. Installing on HQ compiles to the HQ range. If you add a third engine NK-MUM-FW and forget its value, the install on NK-MUM-FW fails with a message that the alias has no value for that engine, and the other two engines are not affected.</p></div>

<h3>Checking the result</h3>
<p>To prove that an alias works, install the policy and look at which rule matched in Logs. In the simulator, a traffic test from STAFF-PC (10.1.1.10) should match the alias rule on the Pune engine. If you edit the alias value, the log result changes only after you install again.</p>
<pre class="out">Install NK-PUNE-FW
  rule 4  alias-local-staff -&gt; any  HTTPS  allow
          resolved: <span class="hl">10.1.1.0/24</span>
Install NK-MUM-FW
  <span class="hl">error: alias alias-local-staff has no value for NK-MUM-FW</span>
  install blocked, nothing changed</pre>

<div class="warn"><p><b>Common mistakes.</b> Adding an engine and forgetting its alias values. Giving an engine a value of the wrong kind (a host where a network was expected) so that rules match too little. Using an alias where a fixed address is intended, for example for the SMC itself. Editing the alias for one engine and forgetting that the same alias also changes the shared rule meaning on that engine.</p></div>
<div class="exam"><p><b>Exam trap.</b> An alias is not a group of addresses that all apply at once. It has exactly one effective value on each engine. Do not confuse an alias with a group element, which contains several members for every engine.</p></div>

<div class="scn"><h4>The new branch with no value</h4><p>MyPnetLab opened a Mumbai branch. A junior engineer cloned the Pune engine, assigned the shared policy and pressed Install. The install stopped with an alias error. The alias for the local staff network had values only for Pune and HQ. The engineer added the Mumbai staff network as the value for the new engine, installed again and the branch got the same rules, with its own addresses.</p><p><b>Lesson:</b> every new engine needs a value for every alias that its policy uses. The validation error is your friend: it stops half-correct policies from reaching the engine.</p></div>

<div class="iv"><p class="q">"How can one firewall policy be used on many sites with different subnets?"</p><p>Use aliases in the rules, and set a value per engine. The SMC resolves them at install time. Mention that this reduces duplicated policies, and that a missing value stops the install through validation. Add that the engine receives the resolved addresses only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An alias is a name with a different value for each engine.</li>
<li>Resolution happens at Install policy, per target engine.</li>
<li>A missing alias value is a validation error and blocks the install.</li>
<li>One shared rule can serve many branches.</li>
<li>An alias has one effective value per engine; it is not a group.</li>
</ul></div>
`,hi:`
<p>MyPnetLab ka sirf ek branch nahi hai. Pune hai, HQ hai aur aur bhi aayenge. Agar har branch ko same policy chahiye, lekin Staff network Pune mein 10.1.1.0/24 hai aur kahin aur kuch aur, to ek rule kaise likhoge? Jawab hai <b>alias</b>.</p>

<h3>Analogy: "ghar" shabd</h3>
<p>Agar aap taxi driver ko kehte ho "mujhe ghar le chalo", to yahi sentence har passenger ke liye kaam karta hai, aur har passenger alag address par pahunchta hai. <i>Ghar</i> shabd ek alias hai: ek naam jiska matlab is par depend karta hai ki poochne wala kaun hai. SMC mein alias aisa element hai jiski <b>value har engine ke hisaab se chuni jati hai</b>, jab policy us engine par install hoti hai. Ek rule keh sakta hai "local staff network ko internet tak allow karo" aur har engine apna staff network bhar leta hai.</p>

<h3>Alias kaise kaam karta hai</h3>
<ol>
<li>Aap alias ek naam ke saath banate ho, jaise <code>alias-local-staff</code>.</li>
<li>Jis engine par use hoga, har ek ke liye alias ko ek <b>value</b> dete ho, jo koi aur element hota hai, jaise network element.</li>
<li>Aap alias ko policy rules mein kisi bhi element ki tarah use karte ho.</li>
<li>Install time par SMC target engine ke liye alias resolve karta hai aur asli addresses us engine configuration mein compile karta hai.</li>
</ol>
<p>Resolution Install policy ke dauran, har engine ke liye hota hai. Policy mein alias ka naam hi rehta hai. Engine alias kabhi nahi dekhta, sirf resolved result dekhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ek alias do engines ke liye resolve hota hua">
<rect x="230" y="15" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Rule: allow alias-local-staff</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">internet tak</text>
<rect x="30" y="110" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="140" y="135" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW par install</text><text x="140" y="153" text-anchor="middle" class="svg-muted" font-size="12">alias = net-staff 10.1.1.0/24</text>
<rect x="390" y="110" width="220" height="60" rx="10" fill="#fde68a"/><text x="500" y="135" text-anchor="middle" class="svg-ink" font-size="13">NK-HQ-FW par install</text><text x="500" y="153" text-anchor="middle" class="svg-muted" font-size="12">alias = HQ LAN network</text>
<line x1="290" y1="65" x2="170" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="65" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="195" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="140" y="220" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.0/24 ke saath compile</text>
<rect x="390" y="195" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="500" y="220" text-anchor="middle" class="svg-ink" font-size="12">HQ network ke saath compile</text>
<line x1="140" y1="170" x2="140" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="170" x2="500" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Rule ek baar likha jata hai. Value install time par har engine ke liye bhari jati hai.</p></div>

<h3>Aliases kyun zaroori hain</h3>
<ul>
<li><b>Kam policies.</b> Ek shared template policy kai branches ko serve kar sakti hai.</li>
<li><b>Kam galtiyan.</b> Aap ek rule ko dus baar copy karke har copy mein ek address nahi badalte.</li>
<li><b>Safe changes.</b> Branch renumber ho to aap us engine ki alias value badalte ho, rule nahi.</li>
</ul>
<p>Policy template ka idea agle module ka hai. Abhi alias aur uske galat hone par focus karo.</p>

<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Value kahan define hoti hai?</td><td>Alias element mein, har engine ke liye ek value</td></tr>
<tr><td>Kab resolve hoti hai?</td><td>Install policy ke dauran, target engine ke liye</td></tr>
<tr><td>Engine ke paas value na ho to?</td><td>Validation error: install block ho jata hai</td></tr>
<tr><td>Kya engine alias ka naam jaanta hai?</td><td>Nahi. Use resolved addresses milte hain</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Alias <code>alias-local-staff</code> ki do values hain: NK-PUNE-FW ke liye network element <code>net-staff</code> (10.1.1.0/24); NK-HQ-FW ke liye HQ LAN network element. Policy mein rule hai "alias-local-staff &rarr; any, HTTPS, allow". Pune par install karne se source 10.1.1.0/24 compile hota hai. HQ par install karne se HQ range compile hoti hai. Agar aap teesra engine NK-MUM-FW jodte ho aur uski value bhool jate ho, to NK-MUM-FW par install us message ke saath fail hota hai ki alias ki us engine ke liye value nahi hai, aur baaki do engines par asar nahi padta.</p></div>

<h3>Result check karna</h3>
<p>Alias kaam karta hai yeh prove karne ke liye policy install karo aur Logs mein dekho kaunsa rule match hua. Simulator mein STAFF-PC (10.1.1.10) se traffic test Pune engine par alias rule se match hona chahiye. Alias value edit karoge to log result dobara install karne ke baad hi badlega.</p>
<pre class="out">Install NK-PUNE-FW
  rule 4  alias-local-staff -&gt; any  HTTPS  allow
          resolved: <span class="hl">10.1.1.0/24</span>
Install NK-MUM-FW
  <span class="hl">error: alias alias-local-staff has no value for NK-MUM-FW</span>
  install blocked, nothing changed</pre>

<div class="warn"><p><b>Common mistakes.</b> Engine jodna aur uski alias values bhool jana. Engine ko galat kism ki value dena (network ki jagah host) jisse rules bahut kam match karte hain. Jahan fixed address chahiye wahan alias use karna, jaise SMC khud ke liye. Ek engine ke liye alias edit karna aur bhool jana ki wahi alias us engine par shared rule ka matlab bhi badal deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Alias addresses ka group nahi hai jo sab ek saath apply hon. Har engine par uski sirf ek effective value hoti hai. Alias ko group element se confuse mat karo, jisme har engine ke liye kai members hote hain.</p></div>

<div class="scn"><h4>Bina value wala naya branch</h4><p>MyPnetLab ne Mumbai branch kholi. Ek junior engineer ne Pune engine clone kiya, shared policy assign ki aur Install dabaya. Install alias error par ruk gaya. Local staff network ke alias ki values sirf Pune aur HQ ke liye thi. Engineer ne naye engine ki value ke roop mein Mumbai staff network jodha, dobara install kiya aur branch ko wahi rules mile, apne addresses ke saath.</p><p><b>Lesson:</b> har naye engine ko un sab aliases ki value chahiye jo uski policy use karti hai. Validation error aapka dost hai: yeh aadhi-sahi policy ko engine tak pahunchne se rokta hai.</p></div>

<div class="iv"><p class="q">"Ek firewall policy alag subnets wali kai sites par kaise use ho sakti hai?"</p><p>Rules mein aliases use karo aur har engine ke liye value set karo. SMC unhe install time par resolve karta hai. Bolo ki isse duplicate policies kam hoti hain, aur value missing ho to validation install rok deti hai. Yeh bhi jodo ki engine ko sirf resolved addresses milte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Alias ek naam hai jiski har engine ke liye alag value hoti hai.</li>
<li>Resolution Install policy par, har target engine ke liye hota hai.</li>
<li>Missing alias value validation error hai aur install block karti hai.</li>
<li>Ek shared rule kai branches ko serve kar sakta hai.</li>
<li>Alias ki har engine par ek effective value hoti hai; yeh group nahi hai.</li>
</ul></div>
`}};export{e as default};