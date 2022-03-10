import styled from "styled-components";
import React from 'react'

const ClickableText = styled.div`
    
    color: var(--main-text-color);
    font-size: 1.2rem;

    :hover{
        color: var(--highlight-color);
        cursor: pointer;
    }
`

const ExpandableIcon = styled.span`
    display: inline-block;
    color: var(--highlight-color);
    
    width: 1rem;
`

const ExpandableContent = styled.div`
    margin-left: 1rem;
    color: var(--main-text-color); 
    font-size: 1rem;

    a{
        color: var(--highlight-color);
        text-decoration: none;

        :hover{
            text-decoration: underline;
        }
    }
`

interface ExpandableProps {
    title: string;
}

export class Expandable extends React.Component<ExpandableProps>
{
    // state: Readonly<{}> = { clicked: false };
    state = { expanded: false };

    // this.setState = { clicked: !this.state.clicked } 
    toggleClick = ()=>{
        console.log("toggleVisibility")
        // React.Children.forEach( this.props.children
        //     , (child)=>{
        //         if (child instanceof ExpandableContent )
        //         {
        //             console.log( "child.toggleExpand" )
        //             child.toggleExpand()
        //         }
        //     })
        this.setState({ expanded: !this.state.expanded } )
    }
    

    render(): React.ReactNode{
        return (
            <ClickableText onClick={this.toggleClick}> 
                <ExpandableIcon>{this.state.expanded ? '-' : '+'}</ExpandableIcon>
                <span>{this.props.title}</span>
                <ExpandableContent>
                    {
                        this.state.expanded &&  this.props.children
                    }
                </ExpandableContent>
            </ClickableText>
        )
    }
}

// export class ExpandableContent extends React.Component 
// {
//     state = { expanded: false };

//     toggleExpand() {
//         this.setState( { expanded: !this.state.expanded } )
//     }

//     render(): React.ReactNode {
//         console.log("ExpandableContent.render")

//         return (
//             <div>{this.state.expanded && this.props.children}</div>
//         )
//     }
// }


