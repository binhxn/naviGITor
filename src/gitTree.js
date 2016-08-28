import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import $ from 'jquery';
import qtip from 'qtip2';
import cydagre from 'cytoscape-dagre';
import dagre from 'dagre';
import cyqtip from 'cytoscape-qtip';
import { ipcRenderer } from 'electron';


// register extension
cyqtip( cytoscape, $ );
cydagre( cytoscape, dagre );

export default class GitTree extends Component {
	constructor() {
		super();
	}

	componentDidMount() {
		let localGitAction;
		let localGitNodes = [];
		let localGitEdges = [];
		console.log('hi');

		localGitAction = ipcRenderer.on('parsedCommitAll', function(event, data){
			console.log('hi2', data);

			// loop through all local git activity, and store as nodes
			for (var i = 0; i < data.length; i++) {
				localGitNodes.push({
					data: {
						id: data[i].SHA
					}
				});
			}

			for (var i = 0; i < data.length; i++) {
				// loop through git merge activity and connect current node with parent nodes
				if (data[i]['event'] === 'merge' && data[i]['event'] !== 'checkout') {
					localGitEdges.push({
						data: {
							source: data[i].parent[0],
							target: data[i].SHA
						}
					},{
						data: {
							source: data[i].parent[1],
							target: data[i].SHA
						}
					});
				}

				// loop through all other events and connect current node to parent node
				if (data[i]['event'] !== 'checkout') {
					localGitEdges.push({
						data: {
							source: data[i].parent[0],
							target: data[i].SHA
						}
					});
				}
			}

			dagTree();

			// // Hides and shows tooltop appropriately, not dynamic
			// cy.qtip({
			// 	content: 'hello',
			// 	show: {
			// 	  event: 'mouseover'
			// 	},
			// 	hide: {
			// 		when: {
			// 		  event: 'mouseleave unfocus'
			// 		}
			// 	}
	  //   });

	  //Needs some polishing
	  	// cy.on('mouseover', 'node', function (event) {
    //     var eid = event.cyTarget._private.data.id
    //     console.log(event.cyTarget._private.data.id);
    //     // console.log($(this));

    //     $(this).qtip({
    //       content: eid,
    //       position: {
    //         at: 'top',
    //         target: $(this)
    //       },
    //       show: {
    //         event: 'mouseover',
    //         ready: true
    //       },
    //       hide: {
    //         // fixed: true,
    //         event: 'mouseleave unfocus'
    //       }
    //     }, event); 
	   //  });
		});


		function dagTree() {
			var cy = window.cy = cytoscape({
				container: document.getElementById('cy'),
				boxSelectionEnabled: false,
				autounselectify: true,
				layout: {
					name: 'dagre'
				},
				style: [
					{
						selector: 'node',
						style: {
							'content': 'data(id)',
							'text-opacity': 0.5,
							'text-valign': 'center',
							'text-halign': 'right',
							'background-color': '#11479e'
						}
					},
					{
						selector: 'edge',
						style: {
							'width': 4,
							'target-arrow-shape': 'triangle',
							'line-color': '#9dbaea',
							'target-arrow-color': '#9dbaea'
						}
					}
				],
				elements: {
					nodes: localGitNodes,
					edges: localGitEdges
				},
			});
		};
	}

	render() {
		return (
			<div className="cytocontainer">
				<div id="cy"></div>
			</div>
		);
	}
}