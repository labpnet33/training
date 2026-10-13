var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now read, write, load and repair JSON, YAML and XML, and you know why automation keeps its data in files. This chapter collects the facts for revision and for the exam.</p>
<h3>Can-do checklist</h3>
<p>Tick an item only if you can do it <b>without looking</b>:</p>
<ul>
<li>Explain what structured data is and why a program prefers it to CLI text.</li>
<li>Write a valid JSON object with strings, numbers, booleans, null, an array and a nested object.</li>
<li>List the JSON rules: double quotes, no trailing comma, no comments, lowercase <code>true</code>, <code>false</code>, <code>null</code>.</li>
<li>Load JSON with <code>json.load</code> / <code>json.loads</code> and write it with <code>json.dump</code> / <code>json.dumps</code>.</li>
<li>Follow a path such as <code>data["devices"][0]["vlans"][1]</code> and the same path in <code>jq</code>.</li>
<li>Write YAML mappings, sequences and nested lists of mappings with correct indentation.</li>
<li>Explain why YAML needs quotes around <code>no</code>, <code>1.10</code> and <code>010</code>, and why tabs are forbidden.</li>
<li>Load YAML safely with <code>yaml.safe_load</code> and explain why <code>safe_load</code> is the habit.</li>
<li>Read an XML tree: elements, attributes, root, and use <code>find</code>, <code>findall</code>, <code>.text</code>, <code>.attrib</code>.</li>
<li>Diagnose a file that will not load: parse error versus use error, validator, one fix at a time, re-run.</li>
</ul>
<h3>Side-by-side cheat-sheet</h3>
<table class="cmp"><tr><th></th><th>JSON</th><th>YAML</th><th>XML</th></tr><tr><td>Container for a dictionary</td><td><code>{"k": "v"}</code></td><td><code>k: v</code></td><td>element with child elements</td></tr><tr><td>Container for a list</td><td><code>[1, 2]</code></td><td><code>- 1</code> on each line</td><td>repeated child elements</td></tr><tr><td>Strings</td><td>always double quotes</td><td>quotes optional</td><td>element text</td></tr><tr><td>Comments</td><td>not allowed</td><td><code>#</code></td><td>allowed between comment markers</td></tr><tr><td>Booleans</td><td><code>true</code> / <code>false</code></td><td><code>true</code> / <code>false</code> (and <code>yes</code> / <code>no</code> in older loaders)</td><td>text such as <code>true</code></td></tr><tr><td>Python module</td><td><code>json</code></td><td><code>yaml</code></td><td><code>xml.etree.ElementTree</code></td></tr><tr><td>Network home</td><td>REST, RESTCONF</td><td>Ansible, variables</td><td>NETCONF</td></tr></table>
<h3>Python quick reference</h3>
<table class="cmp"><tr><th>Task</th><th>Code</th></tr><tr><td>JSON text to data</td><td><code>json.loads(text)</code></td></tr><tr><td>JSON file to data</td><td><code>json.load(f)</code></td></tr><tr><td>Data to JSON text</td><td><code>json.dumps(data, indent=2)</code></td></tr><tr><td>Data to JSON file</td><td><code>json.dump(data, f, indent=2)</code></td></tr><tr><td>YAML to data</td><td><code>yaml.safe_load(f)</code></td></tr><tr><td>Data to YAML text</td><td><code>yaml.safe_dump(data)</code></td></tr><tr><td>XML text to tree</td><td><code>ET.fromstring(text)</code></td></tr><tr><td>Read XML value</td><td><code>root.find("name").text</code></td></tr></table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>structured data</dt><dd>Information with labels and a fixed shape, readable by programs.</dd>
<dt>object / mapping</dt><dd>Labelled values: a JSON object, a YAML mapping, a Python dictionary.</dd>
<dt>array / sequence</dt><dd>Ordered items: a JSON array, a YAML sequence, a Python list.</dd>
<dt>scalar</dt><dd>A single plain value such as text, a number, a boolean or null.</dd>
<dt>validator</dt><dd>A tool that checks a file against the format rules and names the first mistake.</dd>
<dt>jq</dt><dd>A command-line tool that extracts values from JSON using a path.</dd>
<dt>yamllint</dt><dd>A tool that checks YAML syntax and style.</dd>
<dt>namespace</dt><dd>A label in XML saying which vocabulary a tag belongs to.</dd>
<dt>source of truth</dt><dd>The one place where the intended state of the network is recorded.</dd>
<dt>round trip</dt><dd>Dump data to a format, load it back and check it is identical.</dd>
</dl>
<h3>Most tested facts</h3>
<ul>
<li>JSON has no comments, no trailing commas, no single quotes; keys are double-quoted strings.</li>
<li>JSON <code>true</code>, <code>false</code>, <code>null</code> become Python <code>True</code>, <code>False</code>, <code>None</code>.</li>
<li><code>loads</code> and <code>dumps</code> work with strings; <code>load</code> and <code>dump</code> work with files.</li>
<li>YAML structure comes from space indentation; tabs are not allowed; comments start with <code>#</code>.</li>
<li>Always load YAML with <code>yaml.safe_load</code>.</li>
<li>XML has opening and closing tags, one root, attributes in the opening tag, and is used by NETCONF.</li>
<li><code>KeyError</code> points to a key mismatch; <code>JSONDecodeError</code> and <code>YAMLError</code> point to a broken file.</li>
<li>List indexes start at 0, so <code>[1]</code> is the second item.</li>
</ul>
<h3>The two labs in one paragraph each</h3>
<p><b>Lab 1, JSON.</b> <code>inventory.json</code> fails with a single-quote error on line 15 and then a trailing comma on line 24 before the closing brace on line 25; after both fixes <code>show_inv.py</code> fails on <code>KeyError: 'mgmt'</code>, which you cure by using <code>mgmt_ip</code>. Then <code>jq '.devices[0].vlans[1]'</code> gives 20.</p>
<p><b>Lab 2, YAML.</b> <code>vlans.yml</code> has a misaligned dash on line 11; after the fix <code>build.py</code> prints VLANs 10, 20 and 30 for both switches, you add VLAN 40 (GUEST) and switch WH-SW3 in the data only, convert to <code>vlans.json</code> with <code>json.dump(plan, f, indent=2)</code>, and <code>jq '.vlans[1].name'</code> returns <code>"SCANNERS"</code>.</p>
<h3>What comes next</h3>
<p>The next module, parsing, handles the opposite problem: devices that only give <b>text</b>. You will turn <code>show</code> output into the dictionaries and lists you now know how to save as JSON and YAML.</p>
<div class="scn"><h4>The pipeline that rejected a pull request</h4><p>A team added a validation step to its repository: every JSON and YAML file must pass a validator before a merge. The first week it blocked three pull requests, one for a trailing comma and two for YAML indentation. None of the three would have reached production anyway, but each would have broken a nightly job and cost an hour. After a month nobody missed the manual checking.</p>
<p><b>Lesson:</b> validate data files automatically, the same way you test code.</p></div>
<div class="iv"><p class="q">"Why does network automation use YAML for variables and JSON for APIs?"</p><p>YAML is easy for humans to write and review and allows comments, so it suits files that engineers maintain, such as Ansible variables and inventories. JSON is strict and simple for machines to produce and parse, so it suits API traffic. Both load into the same dictionaries and lists, so the code does not care which one it received.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON, YAML and XML are three notations for dictionaries and lists.</li>
<li>JSON is strict; YAML is human-friendly and indentation-based; XML is tag-based and used by NETCONF.</li>
<li>Parse errors mean a broken file; KeyError means a mismatch between data and code.</li>
<li>Keep data in files and logic in code; load YAML with <code>safe_load</code>.</li>
<li>Validate, fix one error at a time, and re-run the whole script.</li>
</ul></div>
`,hi:`
<p>Ab aap JSON, YAML aur XML padh, likh, load aur repair kar sakte ho, aur jaante ho ki automation data ko files mein kyun rakhti hai. Yeh chapter revision aur exam ke liye facts ek jagah jama karta hai.</p>
<h3>Can-do checklist</h3>
<p>Har item tabhi tick karo jab aap use <b>bina dekhe</b> kar sako:</p>
<ul>
<li>Samjhao structured data kya hai aur program use CLI text se kyun pasand karta hai.</li>
<li>Strings, numbers, booleans, null, array aur nested object wala valid JSON object likho.</li>
<li>JSON ke rules batao: double quotes, trailing comma nahi, comments nahi, lowercase <code>true</code>, <code>false</code>, <code>null</code>.</li>
<li><code>json.load</code> / <code>json.loads</code> se JSON load karo aur <code>json.dump</code> / <code>json.dumps</code> se likho.</li>
<li><code>data["devices"][0]["vlans"][1]</code> jaisa path aur wahi path <code>jq</code> mein follow karo.</li>
<li>Sahi indentation ke saath YAML mappings, sequences aur mappings ki nested lists likho.</li>
<li>Samjhao YAML ko <code>no</code>, <code>1.10</code> aur <code>010</code> ke aaspaas quotes kyun chahiye, aur tabs forbidden kyun hain.</li>
<li><code>yaml.safe_load</code> se YAML safely load karo aur samjhao <code>safe_load</code> aadat kyun hai.</li>
<li>XML tree padho: elements, attributes, root, aur <code>find</code>, <code>findall</code>, <code>.text</code>, <code>.attrib</code> use karo.</li>
<li>Aisi file diagnose karo jo load nahi hoti: parse error vs use error, validator, ek ek fix, dobara run.</li>
</ul>
<h3>Side-by-side cheat-sheet</h3>
<table class="cmp"><tr><th></th><th>JSON</th><th>YAML</th><th>XML</th></tr><tr><td>Dictionary ka container</td><td><code>{"k": "v"}</code></td><td><code>k: v</code></td><td>child elements wala element</td></tr><tr><td>List ka container</td><td><code>[1, 2]</code></td><td>har line par <code>- 1</code></td><td>dohraye hue child elements</td></tr><tr><td>Strings</td><td>hamesha double quotes</td><td>quotes optional</td><td>element ka text</td></tr><tr><td>Comments</td><td>allowed nahi</td><td><code>#</code></td><td>comment markers ke beech allowed</td></tr><tr><td>Booleans</td><td><code>true</code> / <code>false</code></td><td><code>true</code> / <code>false</code> (aur purane loaders mein <code>yes</code> / <code>no</code>)</td><td><code>true</code> jaisa text</td></tr><tr><td>Python module</td><td><code>json</code></td><td><code>yaml</code></td><td><code>xml.etree.ElementTree</code></td></tr><tr><td>Network mein ghar</td><td>REST, RESTCONF</td><td>Ansible, variables</td><td>NETCONF</td></tr></table>
<h3>Python quick reference</h3>
<table class="cmp"><tr><th>Kaam</th><th>Code</th></tr><tr><td>JSON text se data</td><td><code>json.loads(text)</code></td></tr><tr><td>JSON file se data</td><td><code>json.load(f)</code></td></tr><tr><td>Data se JSON text</td><td><code>json.dumps(data, indent=2)</code></td></tr><tr><td>Data se JSON file</td><td><code>json.dump(data, f, indent=2)</code></td></tr><tr><td>YAML se data</td><td><code>yaml.safe_load(f)</code></td></tr><tr><td>Data se YAML text</td><td><code>yaml.safe_dump(data)</code></td></tr><tr><td>XML text se tree</td><td><code>ET.fromstring(text)</code></td></tr><tr><td>XML value padho</td><td><code>root.find("name").text</code></td></tr></table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>structured data</dt><dd>Labels aur fixed shape wali jankari jo programs padh sakte hain.</dd>
<dt>object / mapping</dt><dd>Labelled values: JSON object, YAML mapping, Python dictionary.</dd>
<dt>array / sequence</dt><dd>Ordered items: JSON array, YAML sequence, Python list.</dd>
<dt>scalar</dt><dd>Ek seedhi value jaise text, number, boolean ya null.</dd>
<dt>validator</dt><dd>Tool jo file ko format ke rules se check karke pehli galti batata hai.</dd>
<dt>jq</dt><dd>Command-line tool jo path se JSON ki values nikalta hai.</dd>
<dt>yamllint</dt><dd>Tool jo YAML syntax aur style check karta hai.</dd>
<dt>namespace</dt><dd>XML mein label jo batata hai tag kis vocabulary ka hai.</dd>
<dt>source of truth</dt><dd>Woh ek jagah jahan network ki intended state likhi jaati hai.</dd>
<dt>round trip</dt><dd>Data ko format mein dump karo, wapas load karo aur check karo ki identical hai.</dd>
</dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>JSON mein comments nahi, trailing commas nahi, single quotes nahi; keys double-quoted strings hain.</li>
<li>JSON <code>true</code>, <code>false</code>, <code>null</code> Python <code>True</code>, <code>False</code>, <code>None</code> ban jaate hain.</li>
<li><code>loads</code> aur <code>dumps</code> strings ke saath; <code>load</code> aur <code>dump</code> files ke saath.</li>
<li>YAML structure space indentation se aata hai; tabs allowed nahi; comments <code>#</code> se shuru.</li>
<li>YAML hamesha <code>yaml.safe_load</code> se load karo.</li>
<li>XML mein opening aur closing tags, ek root, opening tag mein attributes hote hain, aur NETCONF use karta hai.</li>
<li><code>KeyError</code> key mismatch ki taraf; <code>JSONDecodeError</code> aur <code>YAMLError</code> toote hue file ki taraf ishara karte hain.</li>
<li>List indexes 0 se shuru hote hain, isliye <code>[1]</code> doosra item hai.</li>
</ul>
<h3>Dono labs ek ek paragraph mein</h3>
<p><b>Lab 1, JSON.</b> <code>inventory.json</code> line 15 par single-quote error se fail hoti hai aur phir line 24 ke trailing comma se (closing brace line 25 par); dono fix ke baad <code>show_inv.py</code> <code>KeyError: 'mgmt'</code> par fail hoti hai, jiska ilaaj <code>mgmt_ip</code> use karna hai. Phir <code>jq '.devices[0].vlans[1]'</code> 20 deta hai.</p>
<p><b>Lab 2, YAML.</b> <code>vlans.yml</code> mein line 11 par misaligned dash hai; fix ke baad <code>build.py</code> dono switches ke liye VLANs 10, 20 aur 30 print karti hai, aap sirf data mein VLAN 40 (GUEST) aur switch WH-SW3 jodte ho, <code>json.dump(plan, f, indent=2)</code> se <code>vlans.json</code> mein convert karte ho, aur <code>jq '.vlans[1].name'</code> <code>"SCANNERS"</code> deta hai.</p>
<h3>Aage kya</h3>
<p>Agla module, parsing, ulti problem sambhalta hai: aise devices jo sirf <b>text</b> dete hain. Aap <code>show</code> output ko un dictionaries aur lists mein badaloge jinhe ab aap JSON aur YAML mein save karna jaante ho.</p>
<div class="scn"><h4>Pipeline jisne pull request reject ki</h4><p>Ek team ne apni repository mein validation step jodi: har JSON aur YAML file merge se pehle validator pass kare. Pehle hafte usne teen pull requests roke, ek trailing comma ke liye aur do YAML indentation ke liye. Teeno production tak waise bhi nahi pahunchti, lekin har ek nightly job tod deti aur ek ghanta kharch karti. Ek mahine baad kisi ko haath se checking yaad nahi aayi.</p>
<p><b>Lesson:</b> data files ko code ki tarah automatically validate karo.</p></div>
<div class="iv"><p class="q">"Network automation variables ke liye YAML aur APIs ke liye JSON kyun use karti hai?"</p><p>YAML insaanon ke liye likhna aur review karna aasaan hai aur comments allow karta hai, isliye woh un files ke liye theek hai jinhe engineers maintain karte hain, jaise Ansible variables aur inventories. JSON strict aur machines ke liye produce aur parse karne mein simple hai, isliye API traffic ke liye. Dono wahi dictionaries aur lists mein load hote hain, isliye code ko parwah nahi ki kaun sa mila.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON, YAML aur XML dictionaries aur lists ke teen notations hain.</li>
<li>JSON strict hai; YAML human-friendly aur indentation-based; XML tag-based aur NETCONF mein use hota hai.</li>
<li>Parse errors ka matlab toota file; KeyError ka matlab data aur code ka mismatch.</li>
<li>Data files mein aur logic code mein rakho; YAML <code>safe_load</code> se load karo.</li>
<li>Validate karo, ek ek error fix karo, aur poori script dobara chalao.</li>
</ul></div>
`}};export{e as default};