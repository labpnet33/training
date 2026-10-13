var e={id:`push-options`,h:{en:`Push options: validate-only, include-template, merge, force-template-values, device filter`,hi:`Push options: validate-only, include-template, merge, force-template-values, device filter`},body:{en:`
<p>A push command is not one button; it is a form with options. Most push surprises come from an option the engineer never looked at. This chapter explains each option and why you should always state them explicitly.</p>

<h3>Analogy: the courier slip</h3>
<p>A courier slip has tick boxes: "include the building plan", "open and merge with the branch's own papers", "replace the branch's own notes", "test delivery only". If you rely on pre-ticked defaults, you may ship something you did not intend.</p>

<h3>The options</h3>
<table class="tbl">
<tr><th>Option</th><th>What it does</th><th>Lab default</th></tr>
<tr><td><code>validate-only yes</code></td><td>Runs the same per-firewall checks, changes nothing, records a Validate job</td><td>no</td></tr>
<tr><td><code>include-template yes|no</code></td><td>Device-group push also pushes the firewall's template stack</td><td>yes</td></tr>
<tr><td><code>merge-with-candidate-cfg yes|no</code></td><td>Whether the firewall's own pending changes are committed together with the push</td><td>no</td></tr>
<tr><td><code>force-template-values yes|no</code></td><td>Removes local overrides of values the template defines</td><td>no</td></tr>
<tr><td><code>device &lt;serial&gt;</code></td><td>Limits the push to one firewall</td><td>all in the group</td></tr>
</table>
<p>The defaults in the table are the lab defaults. In a real GUI the defaults of push options differ between versions and screens: <b>check the documentation for your PAN-OS version</b>, and in your own change commands write every option explicitly so the outcome does not depend on a default.</p>

<h3>Reading the options together</h3>
<ul>
<li><b>validate-only</b> is your dry run. Use it before every non-trivial push.</li>
<li><b>include-template</b> saves a step when policy and template change together, but it widens the blast radius: you push two packages at once.</li>
<li><b>merge-with-candidate-cfg</b> is about the firewall's own uncommitted edits. Chapter 9 covers the risk.</li>
<li><b>force-template-values</b> is a clean-up tool for local overrides. It deletes local values that the template defines, so use it deliberately and tell the local team.</li>
<li><b>device</b> is your pilot switch: push to one firewall first, verify, then the rest.</li>
</ul>

<h3>Lab examples</h3>
<pre class="code"><span class="c">! dry run on all firewalls of the group</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes
<span class="c">! pilot on one firewall (serial of NK-PUNE-PA)</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no device 0079185321121</pre>
<pre class="out">Serial            Hostname          Result
0079185321121     NK-PUNE-PA        <span class="hl">validation succeeded</span> (device group NK-BRANCHES)
0079134988264     NK-DELHI-PA       <span class="hl">validation failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them</pre>

<div class="warn"><p><b>Common mistakes.</b> Accepting default options; using force-template-values to "make the push pass" without looking at what it deletes; using include-template yes in a window where only a rule was meant to change.</p></div>
<div class="exam"><p><b>Exam trap.</b> validate-only never changes a firewall but does create a job. Do not confuse "validation succeeded" with "pushed".</p></div>

<div class="scn"><h4>The silent overwrite</h4><p>A local admin had set a DNS server on one firewall as an override. The central team pushed the template stack with force-template-values yes to clean up another issue. The local DNS value disappeared and name resolution changed on that site. Nothing was broken in Panorama; the option did what it says.</p><p><b>Lesson:</b> know what an option deletes before you tick it.</p></div>

<div class="iv"><p class="q">"How do you reduce risk in a push?"</p><p>I run validate-only first, push to one pilot firewall using the device filter, state every option explicitly instead of trusting defaults, and verify on the firewall afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push options are part of the change; write them explicitly.</li>
<li>validate-only is the dry run; device is the pilot switch.</li>
<li>merge-with-candidate-cfg and force-template-values change local state on firewalls.</li>
<li>Default option values depend on version: check your PAN-OS documentation.</li>
</ul></div>
`,hi:`
<p>Push command ek button nahi hai; wo options wala form hai. Zyadatar push surprises us option se aate hain jise engineer ne dekha hi nahi. Ye chapter har option samjhata hai aur batata hai ki unhe hamesha explicitly kyun likhna chahiye.</p>

<h3>Analogy: courier slip</h3>
<p>Courier slip par tick boxes hote hain: "building plan include karo", "branch ke apne papers ke saath merge karo", "branch ke apne notes replace karo", "sirf delivery test karo". Agar aap pre-ticked defaults par bharosa karte ho, to wo bhej sakte ho jo aapne socha nahi tha.</p>

<h3>Options</h3>
<table class="tbl">
<tr><th>Option</th><th>Kya karta hai</th><th>Lab default</th></tr>
<tr><td><code>validate-only yes</code></td><td>Wahi per-firewall checks chalata hai, kuch badalta nahi, Validate job record karta hai</td><td>no</td></tr>
<tr><td><code>include-template yes|no</code></td><td>Device-group push firewall ka template stack bhi push karta hai</td><td>yes</td></tr>
<tr><td><code>merge-with-candidate-cfg yes|no</code></td><td>Firewall ke apne pending changes push ke saath commit hon ya nahi</td><td>no</td></tr>
<tr><td><code>force-template-values yes|no</code></td><td>Template jo values define karta hai unke local overrides hata deta hai</td><td>no</td></tr>
<tr><td><code>device &lt;serial&gt;</code></td><td>Push ko ek firewall tak limit karta hai</td><td>group ke sab</td></tr>
</table>
<p>Table ke defaults lab defaults hain. Real GUI mein push options ke defaults version aur screen ke hisaab se alag hote hain: <b>apne PAN-OS version ki documentation check karo</b>, aur apne change commands mein har option explicitly likho taaki outcome default par depend na kare.</p>

<h3>Options ko saath mein padhna</h3>
<ul>
<li><b>validate-only</b> aapka dry run hai. Har non-trivial push se pehle use karo.</li>
<li><b>include-template</b> tab ek step bachata hai jab policy aur template saath badlein, par blast radius badhata hai: aap do packages ek saath push karte ho.</li>
<li><b>merge-with-candidate-cfg</b> firewall ke apne uncommitted edits ke baare mein hai. Risk chapter 9 mein hai.</li>
<li><b>force-template-values</b> local overrides ka clean-up tool hai. Ye template-defined local values delete karta hai, isliye soch samajhke use karo aur local team ko batao.</li>
<li><b>device</b> aapka pilot switch hai: pehle ek firewall par push, verify, phir baaki.</li>
</ul>

<h3>Lab examples</h3>
<pre class="code"><span class="c">! group ke sab firewalls par dry run</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes
<span class="c">! ek firewall par pilot (NK-PUNE-PA ka serial)</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no device 0079185321121</pre>
<pre class="out">Serial            Hostname          Result
0079185321121     NK-PUNE-PA        <span class="hl">validation succeeded</span> (device group NK-BRANCHES)
0079134988264     NK-DELHI-PA       <span class="hl">validation failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out is already in use by a local rule: rename one of them</pre>

<div class="warn"><p><b>Common mistakes.</b> Default options accept kar lena; "push pass karwane" ke liye force-template-values use karna bina dekhe ki wo kya delete karta hai; jis window mein sirf rule badalni thi usme include-template yes use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> validate-only firewall kabhi nahi badalta par job banata hai. "Validation succeeded" ko "pushed" mat samjho.</p></div>

<div class="scn"><h4>Chupchaap overwrite</h4><p>Ek local admin ne ek firewall par DNS server override ke roop mein set kiya tha. Central team ne doosre issue ke clean-up ke liye template stack force-template-values yes ke saath push kiya. Local DNS value gayab ho gayi aur us site par name resolution badal gaya. Panorama mein kuch toota nahi tha; option ne wahi kiya jo wo kehta hai.</p><p><b>Lesson:</b> option tick karne se pehle jaano ki wo kya delete karta hai.</p></div>

<div class="iv"><p class="q">"Push mein risk kaise kam karte ho?"</p><p>Pehle validate-only chalata hoon, device filter se ek pilot firewall par push karta hoon, har option explicitly likhta hoon defaults par bharosa kiye bina, aur baad mein firewall par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push options change ka hissa hain; explicitly likho.</li>
<li>validate-only dry run hai; device pilot switch hai.</li>
<li>merge-with-candidate-cfg aur force-template-values firewalls ki local state badalte hain.</li>
<li>Default option values version par depend karti hain: apne PAN-OS documentation check karo.</li>
</ul></div>
`}};export{e as default};