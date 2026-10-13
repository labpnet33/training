var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> put the whole module on one page. You started with "I have never written code" and now you can turn a table of site data and one template into a reviewed set of device configs. Use this page the night before an interview or lab exam.</p>

<h3>Analogy: the mail merge you now run yourself</h3>
<p>One letter with blanks, one list of names, one button. The template is the letter, the data is the list, and your script is the button. Everything in this module was a detail of that picture.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module map from data and template to verified device">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">Data</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">CSV / JSON</text>
<rect x="140" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="195" y="55" text-anchor="middle" class="svg-ink" font-size="12">Template</text><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="10">.j2 file</text>
<rect x="270" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="12">render.py</text><text x="325" y="74" text-anchor="middle" class="svg-muted" font-size="10">Environment</text>
<rect x="400" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="455" y="55" text-anchor="middle" class="svg-ink" font-size="12">Review</text><text x="455" y="74" text-anchor="middle" class="svg-muted" font-size="10">diff, count</text>
<rect x="530" y="30" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">Push</text><text x="580" y="74" text-anchor="middle" class="svg-muted" font-size="10">then verify</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">one template, many devices, one reviewed path to the network</text>
</svg><p class="cap">The whole module in one line.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Why templates.</b> Copy-paste and typos; a template plus data repeats safely. <code>pip list</code> shows Jinja2 is installed.</li>
<li><b>2 Placeholders.</b> <code>{{ name }}</code>, keyword arguments to <code>render</code>, dot or bracket access to dictionary values, and <code>**data</code>.</li>
<li><b>3 Loops.</b> <code>{% for %}</code> with <code>{% endfor %}</code>, <code>trim_blocks</code> and <code>lstrip_blocks</code> to keep output tidy, and <code>loop.index</code>.</li>
<li><b>4 Conditions and filters.</b> <code>if</code>, <code>else</code>, <code>endif</code>; filters such as <code>upper</code>, <code>lower</code>, <code>default</code>, <code>join</code>, <code>length</code>; <code>set</code> and comments.</li>
<li><b>5 Data and ipaddress.</b> <code>csv.DictReader</code>, <code>json.loads</code>, <code>ip_interface</code> and <code>ip_network</code>.</li>
<li><b>6 Files and render script.</b> <code>Environment</code>, <code>FileSystemLoader</code>, <code>get_template</code>, writing one file per device.</li>
<li><b>7 Review and push.</b> Render, review, push, verify; <code>send_config_set</code> and <code>save_config</code>.</li>
<li><b>8 Troubleshooting.</b> Last line first; TemplateNotFound, TemplateSyntaxError, ValueError, silent blanks and <code>StrictUndefined</code>.</li>
</ul>

<h3>Command and syntax cheat sheet</h3>
<pre class="code">{{ site.hostname }}              print a value
{% for lan in site.lans %}      start a loop
{% endfor %}                    end the loop
{% if site.isp %}               start a condition
{% endif %}                     end the condition
{{ name | upper }}              apply a filter
env = Environment(loader=FileSystemLoader("templates"),
                  trim_blocks=True, lstrip_blocks=True)
template = env.get_template("branch.j2")
config = template.render(site=site)</pre>
<p>Each line in the first block is a template line, written in a <code>.j2</code> file. The last four lines are Python, written in <code>render.py</code>.</p>

<h3>Exam checklist</h3>
<ul>
<li>I can name the three parts: template, data, script.</li>
<li>I can tell <code>{{ }}</code> (print) from <code>{% %}</code> (logic).</li>
<li>I always close <code>for</code> with <code>endfor</code> and <code>if</code> with <code>endif</code>.</li>
<li>I know a missing variable renders empty unless <code>StrictUndefined</code> is on.</li>
<li>I know <code>ip_interface</code> accepts a host address with prefix and <code>ip_network</code> does not.</li>
<li>I render first, review with <code>diff</code>, push one device, then verify with a show command.</li>
<li>I never put real passwords in code and never edit rendered files by hand.</li>
</ul>

<div class="eg"><p><b>Worked example for revision.</b> Given a list of three VLANs and a template that prints one <code>vlan N</code> line per item, state the output and say what happens if the <code>endfor</code> is missing. Answer: three lines, and without <code>endfor</code> a TemplateSyntaxError that names the tag.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Mixing up <code>{{ }}</code> and <code>{% %}</code>. Forgetting that the diff marker <code>&lt;</code> is your file. Saying a push is finished before verifying. Treating "no error" as "correct".</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often ask what a template prints when a variable is undefined (nothing) or what a loop prints for an empty list (nothing, and no error). Read the data first, then the template.</p></div>

<div class="scn"><h4>Thirty branches, one afternoon</h4><p>A team needs the same base config on thirty branch routers. They keep a CSV of sites, one template, and a render script; they review three files and a diff against a golden file, push one router, verify it, and then roll out in groups. The whole change is in version control, so the next quarter's change is a small edit to the template.</p><p><b>Lesson:</b> the value is repeatability with a review step.</p></div>

<div class="iv"><p class="q">"Explain your config-generation workflow in one minute."</p><p>Data lives in a CSV or JSON file; a Jinja2 template holds the shape of the config; a Python script loads both and writes one file per device. I review a sample and diff against a golden copy, push one device with a library such as netmiko, verify with show commands, and then continue. Credentials come from the environment, and everything is kept in version control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template plus data plus script equals repeatable configs.</li>
<li>Double braces print; brace-percent tags control logic and must be closed.</li>
<li>Strict mode and golden diffs turn quiet mistakes into loud ones.</li>
<li>Render, review, push one, verify, then roll out.</li>
<li>Keep secrets out of code and out of rendered output.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> poore module ko ek page par rakhna. Aapne "maine kabhi code nahi likha" se shuru kiya tha aur ab aap site data ki table aur ek template ko reviewed device configs ke set mein badal sakte ho. Interview ya lab exam se pehli raat is page ko use karo.</p>

<h3>Analogy: mail merge jo ab aap khud chalate ho</h3>
<p>Khaali jagah wala ek letter, naamon ki ek list, ek button. Template letter hai, data list hai, aur aapki script button hai. Is module ki har cheez usi tasveer ki detail thi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Data aur template se verified device tak module map">
<rect x="10" y="30" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">Data</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="10">CSV / JSON</text>
<rect x="140" y="30" width="110" height="60" rx="10" fill="#fde68a"/><text x="195" y="55" text-anchor="middle" class="svg-ink" font-size="12">Template</text><text x="195" y="74" text-anchor="middle" class="svg-muted" font-size="10">.j2 file</text>
<rect x="270" y="30" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="12">render.py</text><text x="325" y="74" text-anchor="middle" class="svg-muted" font-size="10">Environment</text>
<rect x="400" y="30" width="110" height="60" rx="10" fill="#fecaca"/><text x="455" y="55" text-anchor="middle" class="svg-ink" font-size="12">Review</text><text x="455" y="74" text-anchor="middle" class="svg-muted" font-size="10">diff, gino</text>
<rect x="530" y="30" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">Push</text><text x="580" y="74" text-anchor="middle" class="svg-muted" font-size="10">phir verify</text>
<line x1="120" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="250" y1="60" x2="270" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="510" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">ek template, kai devices, network tak ek reviewed raasta</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Why templates.</b> Copy-paste aur typos; template plus data safely repeat hota hai. <code>pip list</code> dikhata hai ki Jinja2 installed hai.</li>
<li><b>2 Placeholders.</b> <code>{{ name }}</code>, <code>render</code> ko keyword arguments, dictionary values tak dot ya bracket access, aur <code>**data</code>.</li>
<li><b>3 Loops.</b> <code>{% for %}</code> aur <code>{% endfor %}</code>, output saaf rakhne ke liye <code>trim_blocks</code> aur <code>lstrip_blocks</code>, aur <code>loop.index</code>.</li>
<li><b>4 Conditions and filters.</b> <code>if</code>, <code>else</code>, <code>endif</code>; <code>upper</code>, <code>lower</code>, <code>default</code>, <code>join</code>, <code>length</code> jaise filters; <code>set</code> aur comments.</li>
<li><b>5 Data and ipaddress.</b> <code>csv.DictReader</code>, <code>json.loads</code>, <code>ip_interface</code> aur <code>ip_network</code>.</li>
<li><b>6 Files and render script.</b> <code>Environment</code>, <code>FileSystemLoader</code>, <code>get_template</code>, har device ke liye ek file likhna.</li>
<li><b>7 Review and push.</b> Render, review, push, verify; <code>send_config_set</code> aur <code>save_config</code>.</li>
<li><b>8 Troubleshooting.</b> Pehle aakhri line; TemplateNotFound, TemplateSyntaxError, ValueError, silent blanks aur <code>StrictUndefined</code>.</li>
</ul>

<h3>Command aur syntax cheat sheet</h3>
<pre class="code">{{ site.hostname }}              print a value
{% for lan in site.lans %}      start a loop
{% endfor %}                    end the loop
{% if site.isp %}               start a condition
{% endif %}                     end the condition
{{ name | upper }}              apply a filter
env = Environment(loader=FileSystemLoader("templates"),
                  trim_blocks=True, lstrip_blocks=True)
template = env.get_template("branch.j2")
config = template.render(site=site)</pre>
<p>Pehle block ki har line template line hai, jo <code>.j2</code> file mein likhi jaati hai. Aakhri chaar lines Python hain, jo <code>render.py</code> mein likhi jaati hain.</p>

<h3>Exam checklist</h3>
<ul>
<li>Main teen hisse bata sakta hoon: template, data, script.</li>
<li>Main <code>{{ }}</code> (print) aur <code>{% %}</code> (logic) mein fark bata sakta hoon.</li>
<li>Main <code>for</code> ko hamesha <code>endfor</code> se aur <code>if</code> ko <code>endif</code> se band karta hoon.</li>
<li>Mujhe pata hai ki missing variable khaali render hota hai jab tak <code>StrictUndefined</code> on na ho.</li>
<li>Mujhe pata hai <code>ip_interface</code> prefix ke saath host address leta hai aur <code>ip_network</code> nahi.</li>
<li>Main pehle render, phir <code>diff</code> se review, ek device push, phir show command se verify karta hoon.</li>
<li>Main asli password code mein kabhi nahi rakhta aur rendered files haath se edit nahi karta.</li>
</ul>

<div class="eg"><p><b>Revision ke liye worked example.</b> Teen VLANs ki list aur ek template diya hai jo har item ke liye ek <code>vlan N</code> line print karta hai; output batao aur bolo ki <code>endfor</code> gayab ho to kya hoga. Jawab: teen lines, aur <code>endfor</code> ke bina TemplateSyntaxError jo tag ka naam batata hai.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> <code>{{ }}</code> aur <code>{% %}</code> ko mix karna. Yeh bhoolna ki diff marker <code>&lt;</code> aapki file hai. Verify karne se pehle push ko poora kehna. "Error nahi" ko "sahi" samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aksar poochte hain ki variable undefined ho to template kya print karta hai (kuch nahi) ya khaali list ke liye loop kya print karta hai (kuch nahi, aur error nahi). Pehle data padho, phir template.</p></div>

<div class="scn"><h4>Tees branches, ek dopahar</h4><p>Ek team ko tees branch routers par wahi base config chahiye. Unke paas sites ki CSV, ek template aur ek render script hai; woh teen files aur golden file se diff review karte hain, ek router push karke verify karte hain, aur phir groups mein rollout karte hain. Poora change version control mein hai, isliye agli quarter ka change template mein chhota edit hai.</p><p><b>Lesson:</b> kimat repeatability mein hai, review step ke saath.</p></div>

<div class="iv"><p class="q">"Apna config-generation workflow ek minute mein samjhao."</p><p>Data CSV ya JSON file mein rehta hai; Jinja2 template config ka shape rakhta hai; Python script dono load karke har device ke liye ek file likhti hai. Main ek sample review karta hoon aur golden copy se diff, netmiko jaisi library se ek device push, show commands se verify, phir aage badhta hoon. Credentials environment se aate hain, aur sab kuch version control mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template plus data plus script barabar repeatable configs.</li>
<li>Double braces print karte hain; brace-percent tags logic chalate hain aur band karne padte hain.</li>
<li>Strict mode aur golden diffs chup galtiyon ko zor-daar bana dete hain.</li>
<li>Render, review, ek push, verify, phir rollout.</li>
<li>Secrets ko code aur rendered output dono se bahar rakho.</li>
</ul></div>
`}};export{e as default};