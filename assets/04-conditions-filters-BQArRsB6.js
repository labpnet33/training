var e={id:`conditions-filters`,h:{en:`Decisions and filters: if, default, upper, join`,hi:`Decisions aur filters: if, default, upper, join`},body:{en:`
<p><b>The idea of this chapter:</b> not every device is the same. Some switches have PoE, some links are trunks, some branches have a backup WAN. Inside a template you decide with <code>{% if %}</code> and you tidy values with <b>filters</b> such as <code>upper</code> and <code>default</code>.</p>

<h3>Analogy: the packing list</h3>
<p>A packing list says "if it is raining, pack an umbrella". Same list, different bag depending on the weather. A template says "if this switch has PoE, add the power line". The template is one document; the answer to each question comes from the data.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="If block chooses lines by data">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">poe = True</text><text x="95" y="102" text-anchor="middle" class="svg-muted" font-size="12">data</text>
<line x1="170" y1="85" x2="220" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="12">{% if poe %}</text><text x="315" y="86" text-anchor="middle" class="svg-muted" font-size="12"> power inline auto</text><text x="315" y="106" text-anchor="middle" class="svg-ink" font-size="12">{% else %} ... {% endif %}</text>
<line x1="410" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="460" y="55" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="82" text-anchor="middle" class="svg-ink" font-size="13">power inline auto</text><text x="540" y="102" text-anchor="middle" class="svg-muted" font-size="12">only the true branch</text>
</svg><p class="cap">The data picks which lines appear in the output.</p></div>

<h3>if, else, endif</h3>
<pre class="code">from jinja2 import Environment

text = """{% if poe %}
power inline auto
{% else %}
power inline never
{% endif %}"""
env = Environment(trim_blocks=True)
template = env.from_string(text)
print(template.render(poe=True))
print(template.render(poe=False))</pre>
<pre class="out">AUTO01$ python3 t5.py
<span class="hl">power inline auto</span>
<span class="hl">power inline never</span></pre>
<ul>
<li><code>{% if poe %}</code> checks whether the value is true. Empty text, zero, <code>False</code> and a missing value all count as false.</li>
<li><code>{% else %}</code> is optional. <code>{% elif other %}</code> adds a second question.</li>
<li><b>Every <code>if</code> needs an <code>endif</code>.</b></li>
<li>You can compare: <code>{% if vlan == 10 %}</code>, <code>{% if role != "access" %}</code>, and combine with <code>and</code>, <code>or</code>, <code>not</code>.</li>
</ul>

<h3>Filters: small tools applied with the pipe</h3>
<p>A <b>filter</b> changes a value before it is printed. You write it after a vertical bar. The script <code>t6.py</code> uses five filters at once:</p>
<pre class="code">print(Template("{{ name | upper }} {{ name | lower }} {{ missing | default('n/a') }} {{ ports | join(', ') }} {{ ports | length }}").render(name="Pun-Acc-Sw1", ports=["Gi0/1", "Gi0/2"]))</pre>
<pre class="out">AUTO01$ python3 t6.py
<span class="hl">PUN-ACC-SW1 pun-acc-sw1 n/a Gi0/1, Gi0/2 2</span>
...</pre>
<table class="cmp"><tr><th>Filter</th><th>What it does</th></tr>
<tr><td><code>upper</code>, <code>lower</code></td><td>change the case of text</td></tr>
<tr><td><code>default('x')</code></td><td>use <code>x</code> when the value is missing</td></tr>
<tr><td><code>join(', ')</code></td><td>glue the items of a list into one text with the separator</td></tr>
<tr><td><code>length</code></td><td>count the items</td></tr></table>
<p><code>default</code> is an <i>intentional</i> choice: "if there is no description, print <code>unused</code>". That is different from silently printing an empty string by accident.</p>

<h3>set, comments and small maths</h3>
<p><code>{% set vlan = 10 %}</code> stores a value inside the template, and <code>{# text #}</code> is a comment that never appears in the output. Expressions allow simple maths and a short inline choice. Output of <code>t9.py</code>:</p>
<pre class="code">print(Template("{% set vlan = 10 %}vlan {{ vlan }} {# a comment #}done").render())
print(Template("{{ 'x' if ok else 'y' }} {{ n + 1 }} {{ n * 2 }}").render(ok=True, n=5))</pre>
<pre class="out">AUTO01$ python3 t9.py
<span class="hl">vlan 10 done</span>
<span class="hl">x 6 10</span></pre>
<p>Keep maths in the template to the bare minimum. Subnet masks, gateways and next hops belong in Python, where you can test them (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> A branch template should add a backup WAN only when the site has one:</p>
<pre class="code">{% if site.backup_wan %}
interface GigabitEthernet0/2
 description BACKUP WAN to {{ site.backup_isp | default('unknown ISP') }}
{% endif %}</pre>
<p>Branches without <code>backup_wan</code> get no extra lines at all. One template, two kinds of site.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A missing <code>{% endif %}</code>. Using one equals sign for comparison (<code>{% if vlan = 10 %}</code> is a syntax error; use <code>==</code>). Hiding a real problem with <code>default</code>: if the VLAN ID is missing, printing a default VLAN is worse than failing. Putting heavy logic in the template that would be easier to test in Python.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing, empty, <code>0</code> and <code>False</code> are all false in <code>{% if %}</code>. So <code>{% if vlan %}</code> is false for VLAN 0. And <code>{# #}</code> comments disappear from output, while an IOS <code>!</code> line is real config text that stays.</p></div>

<div class="scn"><h4>PoE on a switch that has no PoE</h4><p>One generic access template always printed <code>power inline auto</code>. Switches without PoE rejected the line with an error, and a push script that stopped at the first error never configured the rest of the port. After the team added <code>poe</code> to the data and wrapped the line in <code>{% if sw.poe %}</code>, the same template worked on every model. The data file became the one place that records which switch has PoE.</p><p><b>Lesson:</b> differences between devices belong in the data and are expressed in the template with <code>if</code>.</p></div>

<div class="iv"><p class="q">"How do you handle optional parts of a configuration in a template?"</p><p>With <code>{% if %}</code> blocks driven by a field in the data, for example <code>{% if site.backup_wan %}</code>, with <code>{% else %}</code> or <code>{% elif %}</code> where needed. For optional values I use the <code>default</code> filter on purpose, but for mandatory values I want an error, not a default. Mention keeping heavy logic in Python.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{% if x %}</code> ... <code>{% else %}</code> ... <code>{% endif %}</code> chooses lines by data.</li>
<li>Filters use the pipe: <code>upper</code>, <code>lower</code>, <code>default</code>, <code>join</code>, <code>length</code>.</li>
<li><code>{% set %}</code> stores a value; <code>{# #}</code> is a comment that is not printed.</li>
<li>Missing, empty, 0 and False are false.</li>
<li>Keep complicated logic in Python, not in the template.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har device ek jaisa nahi hota. Kisi switch mein PoE hota hai, kisi link ka trunk hota hai, kisi branch mein backup WAN hota hai. Template ke andar aap <code>{% if %}</code> se decide karte ho aur values ko <b>filters</b> jaise <code>upper</code> aur <code>default</code> se saaf karte ho.</p>

<h3>Analogy: packing list</h3>
<p>Packing list kehti hai "agar baarish ho to chhatri rakho". Wahi list, mausam ke hisaab se alag bag. Template kehta hai "agar is switch mein PoE hai to power line jodo". Template ek document hai; har sawaal ka jawab data se aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="If block data se lines choose karta hai">
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">poe = True</text><text x="95" y="102" text-anchor="middle" class="svg-muted" font-size="12">data</text>
<line x1="170" y1="85" x2="220" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="12">{% if poe %}</text><text x="315" y="86" text-anchor="middle" class="svg-muted" font-size="12"> power inline auto</text><text x="315" y="106" text-anchor="middle" class="svg-ink" font-size="12">{% else %} ... {% endif %}</text>
<line x1="410" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="460" y="55" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="540" y="82" text-anchor="middle" class="svg-ink" font-size="13">power inline auto</text><text x="540" y="102" text-anchor="middle" class="svg-muted" font-size="12">sirf true branch</text>
</svg><p class="cap">Data tay karta hai output mein kaunsi lines aayengi.</p></div>

<h3>if, else, endif</h3>
<pre class="code">from jinja2 import Environment

text = """{% if poe %}
power inline auto
{% else %}
power inline never
{% endif %}"""
env = Environment(trim_blocks=True)
template = env.from_string(text)
print(template.render(poe=True))
print(template.render(poe=False))</pre>
<pre class="out">AUTO01$ python3 t5.py
<span class="hl">power inline auto</span>
<span class="hl">power inline never</span></pre>
<ul>
<li><code>{% if poe %}</code> check karta hai ki value true hai ya nahi. Khaali text, zero, <code>False</code> aur missing value sab false maane jaate hain.</li>
<li><code>{% else %}</code> optional hai. <code>{% elif other %}</code> doosra sawaal jodta hai.</li>
<li><b>Har <code>if</code> ko ek <code>endif</code> chahiye.</b></li>
<li>Compare kar sakte ho: <code>{% if vlan == 10 %}</code>, <code>{% if role != "access" %}</code>, aur <code>and</code>, <code>or</code>, <code>not</code> se jod sakte ho.</li>
</ul>

<h3>Filters: pipe se lagne wale chhote tools</h3>
<p><b>Filter</b> print hone se pehle value ko badalta hai. Use vertical bar ke baad likhte hain. Script <code>t6.py</code> ek saath paanch filters use karti hai:</p>
<pre class="code">print(Template("{{ name | upper }} {{ name | lower }} {{ missing | default('n/a') }} {{ ports | join(', ') }} {{ ports | length }}").render(name="Pun-Acc-Sw1", ports=["Gi0/1", "Gi0/2"]))</pre>
<pre class="out">AUTO01$ python3 t6.py
<span class="hl">PUN-ACC-SW1 pun-acc-sw1 n/a Gi0/1, Gi0/2 2</span>
...</pre>
<table class="cmp"><tr><th>Filter</th><th>Kya karta hai</th></tr>
<tr><td><code>upper</code>, <code>lower</code></td><td>text ka case badalta hai</td></tr>
<tr><td><code>default('x')</code></td><td>value missing ho to <code>x</code> use karta hai</td></tr>
<tr><td><code>join(', ')</code></td><td>list ke items ko separator ke saath ek text mein jodta hai</td></tr>
<tr><td><code>length</code></td><td>items ginta hai</td></tr></table>
<p><code>default</code> ek <i>soch-samajh kar</i> kiya gaya choice hai: "description na ho to <code>unused</code> print karo". Yeh galti se chupchaap khaali string print hone se alag hai.</p>

<h3>set, comments aur chhota maths</h3>
<p><code>{% set vlan = 10 %}</code> template ke andar value store karta hai, aur <code>{# text #}</code> comment hai jo output mein kabhi nahi aata. Expressions simple maths aur chhota inline choice allow karte hain. <code>t9.py</code> ka output:</p>
<pre class="code">print(Template("{% set vlan = 10 %}vlan {{ vlan }} {# a comment #}done").render())
print(Template("{{ 'x' if ok else 'y' }} {{ n + 1 }} {{ n * 2 }}").render(ok=True, n=5))</pre>
<pre class="out">AUTO01$ python3 t9.py
<span class="hl">vlan 10 done</span>
<span class="hl">x 6 10</span></pre>
<p>Template mein maths bilkul kam rakho. Subnet masks, gateways aur next hops Python mein rehte hain, jahan unhe test kar sakte ho (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> Branch template mein backup WAN tabhi jude jab site ke paas ho:</p>
<pre class="code">{% if site.backup_wan %}
interface GigabitEthernet0/2
 description BACKUP WAN to {{ site.backup_isp | default('unknown ISP') }}
{% endif %}</pre>
<p>Jin branches mein <code>backup_wan</code> nahi hai unhe koi extra line nahi milti. Ek template, do tarah ki sites.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>{% endif %}</code> gaayab hona. Compare ke liye ek equals sign (<code>{% if vlan = 10 %}</code> syntax error hai; <code>==</code> use karo). <code>default</code> se asli problem chhupana: VLAN ID missing ho to default VLAN print karna fail hone se bura hai. Template mein bhaari logic daalna jo Python mein test karna aasan hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>{% if %}</code> mein missing, khaali, <code>0</code> aur <code>False</code> sab false hain. Isliye <code>{% if vlan %}</code> VLAN 0 ke liye false hai. Aur <code>{# #}</code> comments output se gaayab ho jaate hain, jabki IOS ki <code>!</code> line asli config text hai jo rehti hai.</p></div>

<div class="scn"><h4>PoE us switch par jisme PoE nahi</h4><p>Ek generic access template hamesha <code>power inline auto</code> print karta tha. Bina PoE wale switches ne line ko error ke saath reject kiya, aur push script jo pehle error par ruk jaati thi usne port ki baaki config kabhi nahi lagayi. Team ne data mein <code>poe</code> jodha aur line ko <code>{% if sw.poe %}</code> mein rakha, uske baad wahi template har model par chala. Data file wahi ek jagah ban gayi jahan likha hai kaunse switch mein PoE hai.</p><p><b>Lesson:</b> devices ke beech ke farq data mein rehte hain aur template mein <code>if</code> se vyakt hote hain.</p></div>

<div class="iv"><p class="q">"Configuration ke optional hisson ko template mein kaise sambhalte ho?"</p><p>Data ke field se chalne wale <code>{% if %}</code> blocks se, jaise <code>{% if site.backup_wan %}</code>, jahan zaroorat ho <code>{% else %}</code> ya <code>{% elif %}</code> ke saath. Optional values ke liye <code>default</code> filter jaanbujhkar use karta hoon, par mandatory values ke liye mujhe default nahi, error chahiye. Bhaari logic ko Python mein rakhne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>{% if x %}</code> ... <code>{% else %}</code> ... <code>{% endif %}</code> data se lines choose karta hai.</li>
<li>Filters pipe se lagte hain: <code>upper</code>, <code>lower</code>, <code>default</code>, <code>join</code>, <code>length</code>.</li>
<li><code>{% set %}</code> value store karta hai; <code>{# #}</code> comment hai jo print nahi hota.</li>
<li>Missing, khaali, 0 aur False false hain.</li>
<li>Complicated logic Python mein rakho, template mein nahi.</li>
</ul></div>
`}};export{e as default};